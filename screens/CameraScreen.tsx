import * as React from "react"
import { useRef } from "react"
import { StyleSheet } from "react-native"
import { Camera, Image } from "react-native-pytorch-core"

type Props = {
  onCapture: (image: Image) => void
}

export default function CameraScreen({ onCapture }: Props) {
  const cameraRef = useRef(null)
  return (
    <Camera
      ref={cameraRef}
      style={styles.camera}
      onCapture={onCapture}
      targetResolution={{ width: 1080, height: 1920 }}
    />
  )
}

const styles = StyleSheet.create({
  camera: { width: "100%", height: "100%" },
})
