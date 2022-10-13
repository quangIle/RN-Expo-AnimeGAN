import {
  Image,
  media,
  MobileModel,
  Module,
  torch,
  torchvision,
} from "react-native-pytorch-core"
import type { Tensor } from "react-native-pytorch-core"

// Alias for torchvision transforms
const T = torchvision.transforms

const MODEL_URL =
  "https://github.com/pytorch/live/releases/download/v0.2.0-rc.0/animegan2_face_paint_512_v2.ptl"

let model: Module | null = null

export default async function animeStyle(image: Image): Promise<Image> {
  const t0 = performance.now()
  // Get image width and height
  const width = image.getWidth()
  const height = image.getHeight()

  // Convert image to blob, which is a byte representation of the image
  // in the format height (H), width (W), and channels (C), or HWC for short
  const blob = media.toBlob(image)

  // Get a tensor from image the blob and also define in what format
  // the image blob is.
  let tensor = torch.fromBlob(blob, [height, width, 3])

  // Rearrange the tensor shape to be [CHW]
  tensor = tensor.permute([2, 0, 1])

  // Divide the tensor values by 255 to get values between [0, 1]
  tensor = tensor.div(255)

  // Center crop the image tensor to a square
  const cropValue = Math.min(width, height)
  const centerCrop = T.centerCrop(cropValue)
  tensor = centerCrop(tensor)

  // Resize the image tensor to 3 x min(height, 512) x min(width, 512)
  const resize = T.resize(512)
  tensor = resize(tensor)
  // Shift from [0, 1] to [-1, 1]
  tensor = tensor.mul(2).sub(1)

  // Unsqueeze adds 1 leading dimension to the tensor
  tensor = tensor.unsqueeze(0)

  if (model == null) {
    const filePath = await MobileModel.download(
      require("./face_paint_512_v2_0_cpu.ptl")
    )
    model = await torch.jit._loadForMobile(filePath)
  }
  let outputTensor = await model.forward<Tensor, Tensor>(tensor)

  // Squeeze removes dimension at 0 with size 1
  outputTensor = outputTensor.squeeze(0)

  // Shift from [-1, 1] to [0, 1]
  outputTensor = outputTensor.add(1).div(2)

  // Multiply the tensor values by 255 to get values between [0, 255]
  // and convert the tensor to uint8 tensor
  outputTensor = outputTensor.mul(255).to({ dtype: torch.uint8 })

  const outputImage = media.imageFromTensor(outputTensor)
  const t1 = performance.now()
  console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
  // Convert the tensor to an image
  return outputImage
}
