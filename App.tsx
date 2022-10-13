import { useCallback, useEffect, useState } from "react"
import { Image, ImageUtil } from "react-native-pytorch-core"
import animeStyle from "./AnimeGAN"
import CameraScreen from "./screens/CameraScreen"
import LoadingScreen from "./screens/LoadingScreen"
import ResultsScreen from "./screens/ResultsScreen"

enum ScreenStates {
  CAMERA,
  LOADING,
  RESULTS,
}

import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, View } from "react-native"
import { torch } from "react-native-pytorch-core"

export default function App() {
  const [inputImage, setInputImage] = useState<Image | null>(null)
  const [animeImage, setAnimeImage] = useState<Image | null>(null)
  const [screenState, setScreenState] = useState(ScreenStates.CAMERA)

  // Handle the reset button and return to the camera capturing mode
  const handleReset = useCallback(async () => {
    setScreenState(ScreenStates.CAMERA)
    if (inputImage != null) {
      inputImage.release()
    }
    setInputImage(null)
    setAnimeImage(null)
  }, [inputImage, setInputImage, setAnimeImage, setScreenState])

  // This handler function handles the camera's capture event
  async function handleImage(capturedImage: Image) {
    setInputImage(capturedImage)
    // Wait for image to process through DETR model and draw resulting image
    setScreenState(ScreenStates.LOADING)
    try {
      const newAnimeImage = await animeStyle(capturedImage)
      setAnimeImage(newAnimeImage)
      // Switch to the ResultsScreen to display the detected objects
      setScreenState(ScreenStates.RESULTS)
    } catch (err) {
      console.error(err)
      // In case something goes wrong, go back to the CameraScreen to take a new picture
      handleReset()
    }
  }
  const loadImageAsync = async () => {
    const image = await ImageUtil.fromBundle(require("./truong.jpg"))
    handleImage(image)
  }
  useEffect(() => {
    loadImageAsync()
  }, [])
  return (
    <View style={styles.container}>
      {screenState === ScreenStates.CAMERA && (
        <CameraScreen onCapture={handleImage} />
      )}
      {screenState === ScreenStates.LOADING && <LoadingScreen />}
      {screenState === ScreenStates.RESULTS && (
        <ResultsScreen image={animeImage} onReset={handleReset} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
})
