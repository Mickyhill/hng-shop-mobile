import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/lib/auth";
import { CartProvider } from "./src/lib/cart";
import { Navigator, type Route } from "./src/navigation";
import { CenterMessage, Screen } from "./src/components/ui";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ShopScreen } from "./src/screens/ShopScreen";
import { ProductScreen } from "./src/screens/ProductScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import { SuccessScreen } from "./src/screens/SuccessScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Screen>
        <CenterMessage loading />
      </Screen>
    );
  }

  if (!session) return <LoginScreen />;

  // key: a different account gets a fresh cart and navigation stack.
  return (
    <CartProvider key={session.user.id} userId={session.user.id}>
      <Navigator render={renderRoute} />
    </CartProvider>
  );
}

function renderRoute(route: Route) {
  switch (route.name) {
    case "shop":
      return <ShopScreen />;
    case "product":
      return <ProductScreen product={route.product} />;
    case "cart":
      return <CartScreen />;
    case "checkout":
      return <CheckoutScreen />;
    case "success":
      return <SuccessScreen orderNumber={route.orderNumber} emailSent={route.emailSent} />;
    case "orders":
      return <OrdersScreen />;
  }
}
