// src/screens/FeedScreen.js

import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "./Avatar";
import { useNostr } from "../hooks/useNostr";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { Event as EventNostr } from "nostr-tools";
interface Props {
  navigation: StackNavigationProp<RootStackParamList, "Home">; // Type interface for navigation prop
  title: string;
  content: string;
  post?: any;
  event?: EventNostr;
}

function PostCard({ navigation, post, event }: Props) {
  const { content, author, timestamp, source, id, created_at } = post;
  // const {} = event
  const handlePostPress = (noteId: string) => {
    navigation.navigate("NoteDetailScreen", { noteId });
  };

  return (
    <View style={styles.card}>
      {/* <View style={styles.authorContainer}>
      </View> */}
      <Avatar navigation={navigation} source={source} userId={author} />
      <Text style={styles.author}>{author}</Text>
      <Text style={styles.timestamp}>
        {new Date(Number(created_at) * 1000)?.toISOString()}
      </Text>
      <View style={styles.contentBox}>
        <Text style={styles.content}>{String(content)}</Text>
      </View>

      <TouchableOpacity onPress={() => handlePostPress(id)}>
        <Text>See note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // backgroundColor: "#022b3a",
    width: "100%",
    // width:"50%",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  contentBox: {
    paddingTop: 8,
    paddingBottom: 8,
    // marginBottom: 8,
  },
  content: {
    fontSize: 16,
  },
  authorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  author: {
    fontSize: 14,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
});

export default PostCard;
