// App.js
import { registerRootComponent } from "expo";

import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./src/screens/SplashScreen";
import FeedScreen from "./src/screens/FeedScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { Button, Pressable, View, useColorScheme } from "react-native";
import BottomBar from "./src/components/BottomBar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import NoteDetailScreen from "./src/screens/NoteDetailScreen";
import UserDetailScreen from "./src/screens/UserDetailScreen";
import { RootStackParamList } from "./src/types";
import { useNostr } from "./src/hooks/useNostr";
import LoginScreen from "./src/screens/LoginScreen";
import SignScreen from "./src/screens/SignScreen";

import {AppRegistry} from 'react-native';
// import App from './App';
import {expo } from './app.json';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HeaderGoBack = ({ navigation }) => {
  return (
    <View>
      <Pressable onPress={() => navigation?.goBack()}></Pressable>
    </View>
  );
};
function App() {
  const [isReady, setIsReady] = React.useState(false);
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const toggleDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };
  const { getEvents, getEventsPost, setEvents, events } = useNostr();

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, );
  }, [isReady, events]);

  return (
    <NavigationContainer>
      {/* <Stack.Navigator */}
      <Tab.Navigator
        sceneContainerStyle={{
          backgroundColor: "#022b3a", // Set the default background color for the bottom tab navigator
        }}
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: "#022b3a", // Change the background color of the header
          },

          headerLeft: () => {
            return <HeaderGoBack navigation={navigation} />;
          },
        })}
        tabBar={(props) => <BottomBar {...props} />}
      >
        {isReady ? (
          <>
            <Tab.Screen name="Home" component={FeedScreen} />
            <Tab.Screen name="Login" component={LoginScreen}></Tab.Screen>
            <Tab.Screen name="Sign" component={SignScreen}></Tab.Screen>
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerStyle: {
                  backgroundColor: "#022b3a", // Change the background color of the header
                },
              }}
            />
            <Tab.Screen name="Create" component={CreatePostScreen} />
            <Tab.Screen
              name="NoteDetailScreen"
              component={NoteDetailScreen}
            />
            <Tab.Screen
              name="UserDetailScreen"
              component={UserDetailScreen}
            />
          </>
        ) : (
          <Tab.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}



AppRegistry.registerComponent(expo?.name, () => App);


registerRootComponent(App);

export default App;
