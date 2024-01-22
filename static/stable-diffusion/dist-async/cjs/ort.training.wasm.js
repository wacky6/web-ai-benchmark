/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, resolveBackend;
var init_backend_impl = __esm({
  "common/dist/esm/backend-impl.js"() {
    "use strict";
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    resolveBackend = async (backendHints) => {
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      const errors = [];
      for (const backendName of backendNames) {
        const backendInfo = backends.get(backendName);
        if (backendInfo) {
          if (backendInfo.initialized) {
            return backendInfo.backend;
          } else if (backendInfo.aborted) {
            continue;
          }
          const isInitializing = !!backendInfo.initPromise;
          try {
            if (!isInitializing) {
              backendInfo.initPromise = backendInfo.backend.init(backendName);
            }
            await backendInfo.initPromise;
            backendInfo.initialized = true;
            return backendInfo.backend;
          } catch (e) {
            if (!isInitializing) {
              errors.push({ name: backendName, err: e });
            }
            backendInfo.aborted = true;
          } finally {
            delete backendInfo.initPromise;
          }
        }
      }
      throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
    };
  }
});

// common/dist/esm/backend.js
var init_backend = __esm({
  "common/dist/esm/backend.js"() {
    "use strict";
    init_backend_impl();
  }
});

// common/dist/esm/version.js
var version;
var init_version = __esm({
  "common/dist/esm/version.js"() {
    "use strict";
    version = "1.17.0";
  }
});

// common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "common/dist/esm/env-impl.js"() {
    "use strict";
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// common/dist/esm/env.js
var env2;
var init_env = __esm({
  "common/dist/esm/env.js"() {
    "use strict";
    init_env_impl();
    env2 = env;
  }
});

// common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "common/dist/esm/tensor-conversion-impl.js"() {
    "use strict";
    tensorToDataURL = (tensor, options) => {
      const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        if ("toDataURL" in canvas) {
          return canvas.toDataURL();
        } else {
          throw new Error("toDataURL is not supported");
        }
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "common/dist/esm/tensor-factory-impl.js"() {
    "use strict";
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      const createCanvas = () => {
        if (typeof document !== "undefined") {
          return document.createElement("canvas");
        } else if (typeof OffscreenCanvas !== "undefined") {
          return new OffscreenCanvas(1, 1);
        } else {
          throw new Error("Canvas is not supported");
        }
      };
      const createCanvasContext = (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
          return canvas.getContext("2d");
        } else if (canvas instanceof OffscreenCanvas) {
          return canvas.getContext("2d");
        } else {
          return null;
        }
      };
      if (isHTMLImageEle) {
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = createCanvas();
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = createCanvasContext(tempCanvas);
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = createCanvas();
          const context = createCanvasContext(canvas);
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isBigIntChecked, checkBigInt;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["float16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isBigIntChecked = false;
    checkBigInt = () => {
      if (!isBigIntChecked) {
        isBigIntChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && typeof BigInt64Array.from === "function";
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && typeof BigUint64Array.from === "function";
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
      }
    };
  }
});

// common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "common/dist/esm/tensor-utils-impl.js"() {
    "use strict";
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "common/dist/esm/tensor-impl.js"() {
    "use strict";
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkBigInt();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16") {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "common/dist/esm/tensor.js"() {
    "use strict";
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// common/dist/esm/trace.js
var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
var init_trace = __esm({
  "common/dist/esm/trace.js"() {
    "use strict";
    init_env_impl();
    TRACE = (deviceType, label) => {
      if (!env.wasm.trace) {
        return;
      }
      console.timeStamp(`${deviceType}::ORT::${label}`);
    };
    TRACE_FUNC = (msg, extraMsg) => {
      const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
      let hasTraceFunc = false;
      for (let i = 0; i < stack.length; i++) {
        if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
          let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
          if (extraMsg) {
            label += `::${extraMsg}`;
          }
          TRACE("CPU", label);
          return;
        }
        if (stack[i].includes("TRACE_FUNC")) {
          hasTraceFunc = true;
        }
      }
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (!env.wasm.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (!env.wasm.trace) {
        return;
      }
      TRACE_FUNC("END", extraMsg);
    };
  }
});

// common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "common/dist/esm/inference-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    init_trace();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        TRACE_FUNC_BEGIN();
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        TRACE_FUNC_END();
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        TRACE_FUNC_BEGIN();
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, options);
        TRACE_FUNC_END();
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  }
});

// common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "common/dist/esm/inference-session.js"() {
    "use strict";
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "common/dist/esm/onnx-value.js"() {
    "use strict";
  }
});

// common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "common/dist/esm/training-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
      }
      get trainingInputNames() {
        return this.handler.inputNames;
      }
      get trainingOutputNames() {
        return this.handler.outputNames;
      }
      get evalInputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalInputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      get evalOutputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalOutputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, options);
          return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
       * names.
       * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
       * names.
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async lazyResetGrad() {
        await this.handler.lazyResetGrad();
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
          await this.handler.runOptimizerStep(options || {});
        } else {
          throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
      }
      async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runEvalStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        } else {
          throw new Error("This TrainingSession has no EvalModel loaded.");
        }
      }
      async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        if (array.length !== 4 * paramsSize) {
          throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "common/dist/esm/training-session.js"() {
    "use strict";
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "common/dist/esm/index.js"() {
    "use strict";
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_trace();
    init_onnx_value();
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:node:path
var join;
var init_node_path = __esm({
  "nodejs-ignore:node:path"() {
    join = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  createReadStream: () => createReadStream,
  readFile: () => readFile,
  readFileSync: () => readFileSync
});
var readFile, readFileSync, createReadStream;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
    readFileSync = void 0;
    createReadStream = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join2
});
var join2;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join2 = void 0;
  }
});

// web/lib/wasm/binding/ort-training-wasm-simd.js
var require_ort_training_wasm_simd = __commonJS({
  "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var e = moduleArg, k, l;
        e.ready = new Promise((a, b) => {
          k = a;
          l = b;
        });
        var aa = Object.assign({}, e), ba = "./this.program", ca = "object" == typeof window, q = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, v = "", x, z, A;
        if (da) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));
          v = q ? B.dirname(v) + "/" : __dirname + "/";
          x = (a, b) => {
            a = C(a) ? new URL(a) : B.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          A = (a) => {
            a = x(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          z = (a, b, c, d = true) => {
            a = C(a) ? new URL(a) : B.normalize(a);
            fs.readFile(a, d ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(d ? h.buffer : h);
            });
          };
          !e.thisProgram && 1 < process.argv.length && (ba = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          e.inspect = () => "[Emscripten Module object]";
        } else if (ca || q)
          q ? v = self.location.href : "undefined" != typeof document && document.currentScript && (v = document.currentScript.src), _scriptDir && (v = _scriptDir), 0 !== v.indexOf("blob:") ? v = v.substr(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1) : v = "", x = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, q && (A = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), z = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        var ea = console.log.bind(console), D = console.error.bind(console);
        Object.assign(e, aa);
        aa = null;
        "object" != typeof WebAssembly && E("no native wasm support detected");
        var F, fa = false, G, H, I, J, ha;
        function ia() {
          var a = F.buffer;
          e.HEAP8 = G = new Int8Array(a);
          e.HEAP16 = new Int16Array(a);
          e.HEAPU8 = H = new Uint8Array(a);
          e.HEAPU16 = new Uint16Array(a);
          e.HEAP32 = I = new Int32Array(a);
          e.HEAPU32 = J = new Uint32Array(a);
          e.HEAPF32 = new Float32Array(a);
          e.HEAPF64 = ha = new Float64Array(a);
        }
        var K = [], L = [], ja = [], M = 0, N = null, O = null;
        function E(a) {
          a = "Aborted(" + a + ")";
          D(a);
          fa = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        var ka = (a) => a.startsWith("data:application/octet-stream;base64,"), C = (a) => a.startsWith("file://"), P;
        P = "ort-training-wasm-simd.wasm";
        if (!ka(P)) {
          var la = P;
          P = e.locateFile ? e.locateFile(la, v) : v + la;
        }
        function ma(a) {
          if (A)
            return A(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function na(a) {
          if (ca || q) {
            if ("function" == typeof fetch && !C(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => ma(a));
            if (z)
              return new Promise((b, c) => {
                z(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => ma(a));
        }
        function oa(a, b, c) {
          return na(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            D(`failed to asynchronously prepare wasm: ${d}`);
            E(d);
          });
        }
        function pa(a, b) {
          var c = P;
          return "function" != typeof WebAssembly.instantiateStreaming || ka(c) || C(c) || da || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {
            D(`wasm streaming compile failed: ${g}`);
            D("falling back to ArrayBuffer instantiation");
            return oa(c, a, b);
          }));
        }
        var Q, qa = { 989232: (a, b, c, d) => {
          if ("undefined" == typeof e || !e.Qa)
            return 1;
          a = R(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = e.Qa.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return H.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function ra(a) {
          this.Ka = a - 24;
          this.Pa = function(b) {
            J[this.Ka + 4 >>> 2 >>> 0] = b;
          };
          this.Oa = function(b) {
            J[this.Ka + 8 >>> 2 >>> 0] = b;
          };
          this.Ma = function(b, c) {
            this.Na();
            this.Pa(b);
            this.Oa(c);
          };
          this.Na = function() {
            J[this.Ka + 16 >>> 2 >>> 0] = 0;
          };
        }
        var sa = 0, ta = 0, ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, va = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && ua)
            return ua.decode(a.subarray(b, c));
          for (d = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                d += String.fromCharCode((g & 31) << 6 | h);
              else {
                var m = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              d += String.fromCharCode(g);
          }
          return d;
        }, R = (a, b) => (a >>>= 0) ? va(H, a, b) : "", S = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, T = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var g = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var m = a.charCodeAt(h);
            if (55296 <= m && 57343 >= m) {
              var r = a.charCodeAt(++h);
              m = 65536 + ((m & 1023) << 10) | r & 1023;
            }
            if (127 >= m) {
              if (c >= d)
                break;
              b[c++ >>> 0] = m;
            } else {
              if (2047 >= m) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | m >> 6;
              } else {
                if (65535 >= m) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | m >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | m >> 18;
                  b[c++ >>> 0] = 128 | m >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | m >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | m & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, U = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ca = (a) => {
          var b = S(a) + 1, c = Ba(b);
          c && T(a, H, c, b);
          return c;
        }, V = [], W = {}, Da = () => {
          if (!X) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
              "-",
              "_"
            ) + ".UTF-8", _: ba || "./this.program" }, b;
            for (b in W)
              void 0 === W[b] ? delete a[b] : a[b] = W[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            X = c;
          }
          return X;
        }, X, Ea = [null, [], []], Fa = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ga = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ha(a) {
          var b = Array(S(a) + 1);
          T(a, b, 0, b.length);
          return b;
        }
        function Ia(a, b, c, d) {
          function g(f, n, p) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = p[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function m(f, n) {
            function p(ya) {
              return 0 > ya ? -1 : 0 < ya ? 1 : 0;
            }
            var y;
            0 === (y = p(f.getFullYear() - n.getFullYear())) && 0 === (y = p(f.getMonth() - n.getMonth())) && (y = p(f.getDate() - n.getDate()));
            return y;
          }
          function r(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function w(f) {
            var n = f.Ga;
            for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {
              var p = f.getMonth(), y = (U(f.getFullYear()) ? Fa : Ga)[p];
              if (n > y - f.getDate())
                n -= y - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            p = new Date(f.getFullYear() + 1, 0, 4);
            n = r(new Date(
              f.getFullYear(),
              0,
              4
            ));
            p = r(p);
            return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var t = J[d + 40 >>> 2 >>> 0];
          d = { Ta: I[d >>> 2 >>> 0], Sa: I[d + 4 >>> 2 >>> 0], Ia: I[d + 8 >>> 2 >>> 0], La: I[d + 12 >>> 2 >>> 0], Ja: I[d + 16 >>> 2 >>> 0], Ha: I[d + 20 >>> 2 >>> 0], Ba: I[d + 24 >>> 2 >>> 0], Ga: I[d + 28 >>> 2 >>> 0], Va: I[d + 32 >>> 2 >>> 0], Ra: I[d + 36 >>> 2 >>> 0], Ua: t ? R(t) : "" };
          c = R(c);
          t = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var u in t)
            c = c.replace(new RegExp(u, "g"), t[u]);
          var za = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Aa = "January February March April May June July August September October November December".split(" ");
          t = {
            "%a": (f) => za[f.Ba].substring(0, 3),
            "%A": (f) => za[f.Ba],
            "%b": (f) => Aa[f.Ja].substring(0, 3),
            "%B": (f) => Aa[f.Ja],
            "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2),
            "%d": (f) => h(f.La, 2),
            "%e": (f) => g(f.La, 2, " "),
            "%g": (f) => w(f).toString().substring(2),
            "%G": (f) => w(f),
            "%H": (f) => h(f.Ia, 2),
            "%I": (f) => {
              f = f.Ia;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return h(f, 2);
            },
            "%j": (f) => {
              for (var n = 0, p = 0; p <= f.Ja - 1; n += (U(f.Ha + 1900) ? Fa : Ga)[p++])
                ;
              return h(f.La + n, 3);
            },
            "%m": (f) => h(f.Ja + 1, 2),
            "%M": (f) => h(f.Sa, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM",
            "%S": (f) => h(f.Ta, 2),
            "%t": () => "	",
            "%u": (f) => f.Ba || 7,
            "%U": (f) => h(
              Math.floor((f.Ga + 7 - f.Ba) / 7),
              2
            ),
            "%V": (f) => {
              var n = Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7);
              2 >= (f.Ba + 371 - f.Ga - 2) % 7 && n++;
              if (n)
                53 == n && (p = (f.Ba + 371 - f.Ga) % 7, 4 == p || 3 == p && U(f.Ha) || (n = 1));
              else {
                n = 52;
                var p = (f.Ba + 7 - f.Ga - 1) % 7;
                (4 == p || 5 == p && U(f.Ha % 400 - 1)) && n++;
              }
              return h(n, 2);
            },
            "%w": (f) => f.Ba,
            "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7), 2),
            "%y": (f) => (f.Ha + 1900).toString().substring(2),
            "%Y": (f) => f.Ha + 1900,
            "%z": (f) => {
              f = f.Ra;
              var n = 0 <= f;
              f = Math.abs(f) / 60;
              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.Ua,
            "%%": () => "%"
          };
          c = c.replace(/%%/g, "\0\0");
          for (u in t)
            c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](d)));
          c = c.replace(/\0\0/g, "%");
          u = Ha(c);
          if (u.length > b)
            return 0;
          G.set(u, a >>> 0);
          return u.length - 1;
        }
        var La = { a: function(a, b, c) {
          a >>>= 0;
          new ra(a).Ma(b >>> 0, c >>> 0);
          sa = a;
          ta++;
          throw sa;
        }, e: function() {
          return 0;
        }, H: function() {
        }, x: function() {
        }, z: function() {
        }, J: function() {
          return 0;
        }, F: function() {
        }, A: function() {
        }, E: function() {
        }, g: function() {
        }, y: function() {
        }, v: function() {
        }, G: function() {
        }, w: function() {
        }, k: () => 1, n: function(a, b, c) {
          a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
          c >>>= 0;
          a = new Date(1e3 * a);
          I[c >>> 2 >>> 0] = a.getUTCSeconds();
          I[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();
          I[c + 8 >>> 2 >>> 0] = a.getUTCHours();
          I[c + 12 >>> 2 >>> 0] = a.getUTCDate();
          I[c + 16 >>> 2 >>> 0] = a.getUTCMonth();
          I[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
          I[c + 24 >>> 2 >>> 0] = a.getUTCDay();
          I[c + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
        }, o: function(a, b, c) {
          a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
          c >>>= 0;
          a = new Date(1e3 * a);
          I[c >>> 2 >>> 0] = a.getSeconds();
          I[c + 4 >>> 2 >>> 0] = a.getMinutes();
          I[c + 8 >>> 2 >>> 0] = a.getHours();
          I[c + 12 >>> 2 >>> 0] = a.getDate();
          I[c + 16 >>> 2 >>> 0] = a.getMonth();
          I[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
          I[c + 24 >>> 2 >>> 0] = a.getDay();
          I[c + 28 >>> 2 >>> 0] = (U(a.getFullYear()) ? wa : xa)[a.getMonth()] + a.getDate() - 1 | 0;
          I[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
          b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
          var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
          I[c + 32 >>> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
        }, p: function(a) {
          a >>>= 0;
          var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
          0 > c ? I[a + 32 >>> 2 >>> 0] = Number(g != h && m == d) : 0 < c != (m == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));
          I[a + 24 >>> 2 >>> 0] = b.getDay();
          I[a + 28 >>> 2 >>> 0] = (U(b.getFullYear()) ? wa : xa)[b.getMonth()] + b.getDate() - 1 | 0;
          I[a >>> 2 >>> 0] = b.getSeconds();
          I[a + 4 >>> 2 >>> 0] = b.getMinutes();
          I[a + 8 >>> 2 >>> 0] = b.getHours();
          I[a + 12 >>> 2 >>> 0] = b.getDate();
          I[a + 16 >>> 2 >>> 0] = b.getMonth();
          I[a + 20 >>> 2 >>> 0] = b.getYear();
          a = b.getTime();
          isNaN(a) ? (I[Ja() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
          return Ka((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
        }, l: function() {
          return -52;
        }, m: function() {
        }, t: function(a, b, c) {
          function d(w) {
            return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
          }
          c >>>= 0;
          var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
          g = h.getTimezoneOffset();
          var r = m.getTimezoneOffset();
          J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(g, r);
          I[b >>> 0 >>> 2 >>> 0] = Number(g != r);
          a = d(h);
          b = d(m);
          a = Ca(a);
          b = Ca(b);
          r < g ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);
        }, d: () => {
          E("");
        }, B: function(a, b, c) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          V.length = 0;
          for (var d; d = H[b++ >>> 0]; ) {
            var g = 105 != d;
            g &= 112 != d;
            c += g && c % 8 ? 4 : 0;
            V.push(112 == d ? J[c >>> 2 >>> 0] : 105 == d ? I[c >>> 2 >>> 0] : ha[c >>> 3 >>> 0]);
            c += g ? 8 : 4;
          }
          return qa[a].apply(null, V);
        }, h: () => Date.now(), u: function() {
          return 4294901760;
        }, b: () => performance.now(), I: function(a, b, c) {
          b >>>= 0;
          return H.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
        }, s: function(a) {
          a >>>= 0;
          var b = H.length;
          if (4294901760 < a)
            return false;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            var g = Math;
            d = Math.max(a, d);
            a: {
              g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - F.buffer.byteLength + 65535) / 65536;
              try {
                F.grow(g);
                ia();
                var h = 1;
                break a;
              } catch (m) {
              }
              h = void 0;
            }
            if (h)
              return true;
          }
          return false;
        }, C: function(a, b) {
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Da().forEach((d, g) => {
            var h = b + c;
            g = J[a + 4 * g >>> 2 >>> 0] = h;
            for (h = 0; h < d.length; ++h)
              G[g++ >>> 0 >>> 0] = d.charCodeAt(h);
            G[g >>> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }, D: function(a, b) {
          a >>>= 0;
          b >>>= 0;
          var c = Da();
          J[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((g) => d += g.length + 1);
          J[b >>> 2 >>> 0] = d;
          return 0;
        }, f: () => 52, j: function() {
          return 52;
        }, q: function() {
          return 70;
        }, i: function(a, b, c, d) {
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var g = 0, h = 0; h < c; h++) {
            var m = J[b >>> 2 >>> 0], r = J[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var w = 0; w < r; w++) {
              var t = H[m + w >>> 0], u = Ea[a];
              0 === t || 10 === t ? ((1 === a ? ea : D)(va(u, 0)), u.length = 0) : u.push(t);
            }
            g += r;
          }
          J[d >>> 2 >>> 0] = g;
          return 0;
        }, r: Ia, c: function(a, b, c, d) {
          return Ia(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
        } }, Y = function() {
          function a(c) {
            Y = c.exports;
            Y = Ma();
            F = Y.K;
            ia();
            L.unshift(Y.L);
            M--;
            0 == M && (null !== N && (clearInterval(N), N = null), O && (c = O, O = null, c()));
            return Y;
          }
          var b = { a: La };
          M++;
          if (e.instantiateWasm)
            try {
              return e.instantiateWasm(b, a);
            } catch (c) {
              D(`Module.instantiateWasm callback failed with error: ${c}`), l(c);
            }
          pa(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        }();
        e._OrtInit = (a, b) => (e._OrtInit = Y.M)(a, b);
        e._OrtGetLastError = (a, b) => (e._OrtGetLastError = Y.N)(a, b);
        e._OrtCreateSessionOptions = (a, b, c, d, g, h, m, r, w, t) => (e._OrtCreateSessionOptions = Y.O)(a, b, c, d, g, h, m, r, w, t);
        e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = Y.P)(a, b);
        e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = Y.Q)(a, b, c);
        e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = Y.R)(a, b, c);
        e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = Y.S)(a);
        e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = Y.T)(a, b, c);
        e._OrtReleaseSession = (a) => (e._OrtReleaseSession = Y.U)(a);
        e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = Y.V)(a, b, c);
        e._OrtGetInputName = (a, b) => (e._OrtGetInputName = Y.W)(a, b);
        e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = Y.X)(a, b);
        e._OrtFree = (a) => (e._OrtFree = Y.Y)(a);
        e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = Y.Z)(a, b, c, d, g, h);
        e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = Y._)(a, b, c, d, g);
        e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = Y.$)(a);
        e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = Y.aa)(a, b, c, d);
        e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = Y.ba)(a, b, c);
        e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = Y.ca)(a);
        e._OrtCreateBinding = (a) => (e._OrtCreateBinding = Y.da)(a);
        e._OrtBindInput = (a, b, c) => (e._OrtBindInput = Y.ea)(a, b, c);
        e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = Y.fa)(a, b, c, d);
        e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = Y.ga)(a);
        e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = Y.ha)(a);
        e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = Y.ia)(a, b, c, d, g);
        e._OrtRun = (a, b, c, d, g, h, m, r) => (e._OrtRun = Y.ja)(a, b, c, d, g, h, m, r);
        e._OrtEndProfiling = (a) => (e._OrtEndProfiling = Y.ka)(a);
        e._OrtTrainingLoadCheckpoint = (a, b) => (e._OrtTrainingLoadCheckpoint = Y.la)(a, b);
        e._OrtTrainingReleaseCheckpoint = (a) => (e._OrtTrainingReleaseCheckpoint = Y.ma)(a);
        e._OrtTrainingCreateSession = (a, b, c, d, g, h, m, r) => (e._OrtTrainingCreateSession = Y.na)(a, b, c, d, g, h, m, r);
        e._OrtTrainingLazyResetGrad = (a) => (e._OrtTrainingLazyResetGrad = Y.oa)(a);
        e._OrtTrainingRunTrainStep = (a, b, c, d, g, h) => (e._OrtTrainingRunTrainStep = Y.pa)(a, b, c, d, g, h);
        e._OrtTrainingOptimizerStep = (a, b) => (e._OrtTrainingOptimizerStep = Y.qa)(a, b);
        e._OrtTrainingEvalStep = (a, b, c, d, g, h) => (e._OrtTrainingEvalStep = Y.ra)(a, b, c, d, g, h);
        e._OrtTrainingGetParametersSize = (a, b, c) => (e._OrtTrainingGetParametersSize = Y.sa)(a, b, c);
        e._OrtTrainingCopyParametersToBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersToBuffer = Y.ta)(a, b, c, d);
        e._OrtTrainingCopyParametersFromBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersFromBuffer = Y.ua)(a, b, c, d);
        e._OrtTrainingGetModelInputOutputCount = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputCount = Y.va)(a, b, c, d);
        e._OrtTrainingGetModelInputOutputName = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputName = Y.wa)(a, b, c, d);
        e._OrtTrainingReleaseSession = (a) => (e._OrtTrainingReleaseSession = Y.xa)(a);
        var Ja = () => (Ja = Y.ya)(), Ba = e._malloc = (a) => (Ba = e._malloc = Y.za)(a);
        e._free = (a) => (e._free = Y.Aa)(a);
        var Ka = (a) => (Ka = Y.Ca)(a), Na = () => (Na = Y.Da)(), Oa = (a) => (Oa = Y.Ea)(a), Pa = (a) => (Pa = Y.Fa)(a);
        function Ma() {
          var a = Y;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;
          a.ya = b(a.ya);
          a.za = c(a.za);
          a.Da = b(a.Da);
          a.Fa = c(a.Fa);
          return a;
        }
        e.stackAlloc = Pa;
        e.stackSave = Na;
        e.stackRestore = Oa;
        e.UTF8ToString = R;
        e.stringToUTF8 = (a, b, c) => T(a, H, b, c);
        e.lengthBytesUTF8 = S;
        var Z;
        O = function Qa() {
          Z || Ra();
          Z || (O = Qa);
        };
        function Ra() {
          if (!(0 < M)) {
            if (e.preRun)
              for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; ) {
                var a = e.preRun.shift();
                K.unshift(a);
              }
            for (; 0 < K.length; )
              K.shift()(e);
            if (!(0 < M || Z || (Z = true, e.calledRun = true, fa))) {
              for (; 0 < L.length; )
                L.shift()(e);
              for (k(e); 0 < ja.length; )
                ja.shift()(e);
            }
          }
        }
        Ra();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// nodejs-ignore:worker_threads
var require_worker_threads = __commonJS({
  "nodejs-ignore:worker_threads"() {
  }
});

// nodejs-ignore:perf_hooks
var require_perf_hooks = __commonJS({
  "nodejs-ignore:perf_hooks"() {
  }
});

// nodejs-ignore:os
var os_exports = {};
__export(os_exports, {
  cpus: () => cpus2
});
var cpus2;
var init_os = __esm({
  "nodejs-ignore:os"() {
    cpus2 = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.js
var require_ort_wasm_threaded = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module2) {
    "use strict";
    var ortWasmThreaded = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        function g() {
          m.buffer != p.buffer && q();
          return p;
        }
        function t() {
          m.buffer != p.buffer && q();
          return aa;
        }
        function ba() {
          m.buffer != p.buffer && q();
          return ca;
        }
        function da() {
          m.buffer != p.buffer && q();
          return ea;
        }
        function v() {
          m.buffer != p.buffer && q();
          return fa;
        }
        function w() {
          m.buffer != p.buffer && q();
          return ha;
        }
        function ia() {
          m.buffer != p.buffer && q();
          return ja;
        }
        var z = moduleArg, ka, la;
        z.ready = new Promise((a, b) => {
          ka = a;
          la = b;
        });
        var ma = Object.assign({}, z), na = "./this.program", oa = (a, b) => {
          throw b;
        }, pa = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = z.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function qa(a) {
          return z.locateFile ? z.locateFile(a, E) : E + a;
        }
        var ra, sa, ta;
        if (B) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), ua = (init_path(), __toCommonJS(path_exports));
          E = A ? ua.dirname(E) + "/" : __dirname + "/";
          ra = (b, c) => {
            b = va(b) ? new URL(b) : ua.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          ta = (b) => {
            b = ra(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          sa = (b, c, d, e = true) => {
            b = va(b) ? new URL(b) : ua.normalize(b);
            fs.readFile(b, e ? void 0 : "utf8", (f, k) => {
              f ? d(f) : c(e ? k.buffer : k);
            });
          };
          !z.thisProgram && 1 < process.argv.length && (na = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          oa = (b, c) => {
            process.exitCode = b;
            throw c;
          };
          z.inspect = () => "[Emscripten Module object]";
          let a;
          try {
            a = require_worker_threads();
          } catch (b) {
            throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
          }
          global.Worker = a.Worker;
        } else if (pa || A)
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ra = (a) => {
            var b = new XMLHttpRequest();
            b.open(
              "GET",
              a,
              false
            );
            b.send(null);
            return b.responseText;
          }, A && (ta = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), sa = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          });
        B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var wa = console.log.bind(console), xa = console.error.bind(console);
        B && (wa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), xa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var ya = wa, F = xa;
        Object.assign(z, ma);
        ma = null;
        "object" != typeof WebAssembly && za("no native wasm support detected");
        var m, Aa, Ba = false, G, p, aa, ca, ea, fa, ha, Ca, H, Da, ja;
        function q() {
          var a = m.buffer;
          z.HEAP8 = p = new Int8Array(a);
          z.HEAP16 = ca = new Int16Array(a);
          z.HEAPU8 = aa = new Uint8Array(a);
          z.HEAPU16 = ea = new Uint16Array(a);
          z.HEAP32 = fa = new Int32Array(a);
          z.HEAPU32 = ha = new Uint32Array(a);
          z.HEAPF32 = Ca = new Float32Array(a);
          z.HEAPF64 = ja = new Float64Array(a);
          z.HEAP64 = H = new BigInt64Array(a);
          z.HEAPU64 = Da = new BigUint64Array(a);
        }
        var Ea = 16777216;
        if (D)
          m = z.wasmMemory;
        else if (z.wasmMemory)
          m = z.wasmMemory;
        else if (m = new WebAssembly.Memory({ initial: Ea / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))
          throw F("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && F("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        q();
        Ea = m.buffer.byteLength;
        var Fa = [], Ga = [], Ha = [], I = 0, Ia = null, J = null;
        function Ja() {
          I--;
          if (0 == I && (null !== Ia && (clearInterval(Ia), Ia = null), J)) {
            var a = J;
            J = null;
            a();
          }
        }
        function za(a) {
          a = "Aborted(" + a + ")";
          F(a);
          Ba = true;
          G = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          la(a);
          throw a;
        }
        var Ka = (a) => a.startsWith("data:application/octet-stream;base64,"), va = (a) => a.startsWith("file://"), K;
        K = "ort-wasm-threaded.wasm";
        Ka(K) || (K = qa(K));
        function La(a) {
          if (ta)
            return ta(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ma(a) {
          if (pa || A) {
            if ("function" == typeof fetch && !va(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => La(a));
            if (sa)
              return new Promise((b, c) => {
                sa(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => La(a));
        }
        function Na(a, b, c) {
          return Ma(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            F(`failed to asynchronously prepare wasm: ${d}`);
            za(d);
          });
        }
        function Oa(a, b) {
          var c = K;
          return "function" != typeof WebAssembly.instantiateStreaming || Ka(c) || va(c) || B || "function" != typeof fetch ? Na(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
            F(`wasm streaming compile failed: ${e}`);
            F("falling back to ArrayBuffer instantiation");
            return Na(c, a, b);
          }));
        }
        var Pa = { 891868: (a, b, c, d) => {
          if ("undefined" == typeof z || !z.Hb)
            return 1;
          a = L(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = z.Hb.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return t().set(a.subarray(b, b + c), d >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function Qa(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        var Ra = (a) => {
          a.terminate();
          a.onmessage = () => {
          };
        }, Ta = (a) => {
          0 == M.ob.length && (Sa(), M.Bb(M.ob[0]));
          var b = M.ob.pop();
          if (!b)
            return 6;
          M.pb.push(b);
          M.kb[a.nb] = b;
          b.nb = a.nb;
          var c = { cmd: "run", start_routine: a.Ob, arg: a.Ib, pthread_ptr: a.nb };
          B && b.unref();
          b.postMessage(c, a.Ub);
          return 0;
        }, O = 0, Ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Va = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && Ua)
            return Ua.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (d = ""; b < c; ) {
            var e = a[b++];
            if (e & 128) {
              var f = a[b++] & 63;
              if (192 == (e & 224))
                d += String.fromCharCode((e & 31) << 6 | f);
              else {
                var k = a[b++] & 63;
                e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;
                65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
              }
            } else
              d += String.fromCharCode(e);
          }
          return d;
        }, L = (a, b) => (a >>>= 0) ? Va(t(), a, b) : "", Ya = (a) => {
          var b = Wa();
          a = a();
          Xa(b);
          return a;
        };
        function P(a, b) {
          var c = arguments.length - 2, d = arguments;
          return Ya(() => {
            for (var e = 2 * c, f = Za(8 * e), k = f >>> 3, l = 0; l < c; l++) {
              var r = d[2 + l];
              "bigint" == typeof r ? (H[k + 2 * l] = 1n, H[k + 2 * l + 1] = r) : (H[k + 2 * l] = 0n, ia()[k + 2 * l + 1 >>> 0] = r);
            }
            return $a(a, e, f, b);
          });
        }
        function ab(a) {
          if (D)
            return P(0, 1, a);
          G = a;
          0 < O || (M.Pb(), z.onExit?.(a), Ba = true);
          oa(a, new Qa(a));
        }
        var cb = (a) => {
          G = a;
          if (D)
            throw bb(a), "unwind";
          ab(a);
        };
        function db() {
          for (var a = z.numThreads; a--; )
            Sa();
          Fa.unshift(() => {
            I++;
            eb(() => Ja());
          });
        }
        function Sa() {
          var a = qa("ort-wasm-threaded.worker.js");
          a = new Worker(a);
          M.ob.push(a);
        }
        function eb(a) {
          D ? a() : Promise.all(M.ob.map(M.Bb)).then(a);
        }
        var M = { ob: [], pb: [], Gb: [], kb: {}, wb() {
          D ? (M.receiveObjectTransfer = M.Nb, M.threadInitTLS = M.Fb, M.setExitStatus = M.Eb) : db();
        }, Eb: (a) => G = a, Xb: ["$terminateWorker"], Pb: () => {
          for (var a of M.pb)
            Ra(a);
          for (a of M.ob)
            Ra(a);
          M.ob = [];
          M.pb = [];
          M.kb = [];
        }, Db: (a) => {
          var b = a.nb;
          delete M.kb[b];
          M.ob.push(a);
          M.pb.splice(M.pb.indexOf(a), 1);
          a.nb = 0;
          fb(b);
        }, Nb() {
        }, Fb() {
          M.Gb.forEach((a) => a());
        }, Bb: (a) => new Promise((b) => {
          a.onmessage = (f) => {
            f = f.data;
            var k = f.cmd;
            if (f.targetThread && f.targetThread != gb()) {
              var l = M.kb[f.targetThread];
              l ? l.postMessage(f, f.transferList) : F(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);
            } else if ("checkMailbox" === k)
              hb();
            else if ("spawnThread" === k)
              Ta(f);
            else if ("cleanupThread" === k)
              M.Db(M.kb[f.thread]);
            else if ("killThread" === k)
              f = f.thread, k = M.kb[f], delete M.kb[f], Ra(k), fb(f), M.pb.splice(M.pb.indexOf(k), 1), k.nb = 0;
            else if ("cancelThread" === k)
              M.kb[f.thread].postMessage({ cmd: "cancel" });
            else if ("loaded" === k)
              a.loaded = true, B && !a.nb && a.unref(), b(a);
            else if ("alert" === k)
              alert(`Thread ${f.threadId}: ${f.text}`);
            else if ("setimmediate" === f.target)
              a.postMessage(f);
            else if ("callHandler" === k)
              z[f.handler](...f.args);
            else
              k && F(`worker sent an unknown command ${k}`);
          };
          a.onerror = (f) => {
            F(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);
            throw f;
          };
          B && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));
          var c = [], d = ["onExit"], e;
          for (e of d)
            z.hasOwnProperty(e) && c.push(e);
          a.postMessage({ cmd: "load", handlers: c, urlOrBlob: z.mainScriptUrlOrBlob || _scriptDir, wasmMemory: m, wasmModule: Aa });
        }) };
        z.PThread = M;
        var ib = (a) => {
          for (; 0 < a.length; )
            a.shift()(z);
        };
        z.establishStackSpace = () => {
          var a = gb(), b = w()[a + 52 >>> 2 >>> 0];
          a = w()[a + 56 >>> 2 >>> 0];
          jb(b, b - a);
          Xa(b);
        };
        function bb(a) {
          if (D)
            return P(1, 0, a);
          cb(a);
        }
        var kb = [], lb;
        z.invokeEntryPoint = (a, b) => {
          var c = kb[a];
          c || (a >= kb.length && (kb.length = a + 1), kb[a] = c = lb.get(a));
          a = c(b);
          0 < O ? M.Eb(a) : mb(a);
        };
        function nb(a) {
          this.tb = a - 24;
          this.Mb = function(b) {
            w()[this.tb + 4 >>> 2 >>> 0] = b;
          };
          this.yb = function(b) {
            w()[this.tb + 8 >>> 2 >>> 0] = b;
          };
          this.wb = function(b, c) {
            this.xb();
            this.Mb(b);
            this.yb(c);
          };
          this.xb = function() {
            w()[this.tb + 16 >>> 2 >>> 0] = 0;
          };
        }
        var ob = 0, pb = 0;
        function qb(a, b, c, d) {
          return D ? P(2, 1, a, b, c, d) : rb(a, b, c, d);
        }
        function rb(a, b, c, d) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return F("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var e = [];
          if (D && 0 === e.length)
            return qb(a, b, c, d);
          a = { Ob: c, nb: a, Ib: d, Ub: e };
          return D ? (a.Wb = "spawnThread", postMessage(a, e), 0) : Ta(a);
        }
        function sb(a, b, c) {
          return D ? P(3, 1, a, b, c) : 0;
        }
        function tb(a, b) {
          if (D)
            return P(4, 1, a, b);
        }
        var ub = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, vb = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var e = c;
          d = c + d - 1;
          for (var f = 0; f < a.length; ++f) {
            var k = a.charCodeAt(f);
            if (55296 <= k && 57343 >= k) {
              var l = a.charCodeAt(++f);
              k = 65536 + ((k & 1023) << 10) | l & 1023;
            }
            if (127 >= k) {
              if (c >= d)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - e;
        }, wb = (a, b, c) => vb(a, t(), b, c);
        function xb(a, b) {
          if (D)
            return P(5, 1, a, b);
        }
        function yb(a, b, c) {
          if (D)
            return P(6, 1, a, b, c);
        }
        function zb(a, b, c) {
          return D ? P(7, 1, a, b, c) : 0;
        }
        function Ab(a, b) {
          if (D)
            return P(8, 1, a, b);
        }
        function Bb(a, b, c) {
          if (D)
            return P(9, 1, a, b, c);
        }
        function Cb(a, b, c, d) {
          if (D)
            return P(10, 1, a, b, c, d);
        }
        function Db(a, b, c, d) {
          if (D)
            return P(11, 1, a, b, c, d);
        }
        function Eb(a, b, c, d) {
          if (D)
            return P(12, 1, a, b, c, d);
        }
        function Fb(a) {
          if (D)
            return P(13, 1, a);
        }
        function Gb(a, b) {
          if (D)
            return P(14, 1, a, b);
        }
        function Hb(a, b, c) {
          if (D)
            return P(15, 1, a, b, c);
        }
        var Ib = (a) => {
          if (null === a)
            return "null";
          var b = typeof a;
          return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
        }, Jb, R = (a) => {
          for (var b = ""; t()[a >>> 0]; )
            b += Jb[t()[a++ >>> 0]];
          return b;
        }, Kb = {}, Lb = {}, Mb = {}, S;
        function Nb(a, b, c = {}) {
          var d = b.name;
          if (!a)
            throw new S(`type "${d}" must have a positive integer typeid pointer`);
          if (Lb.hasOwnProperty(a)) {
            if (c.Kb)
              return;
            throw new S(`Cannot register type '${d}' twice`);
          }
          Lb[a] = b;
          delete Mb[a];
          Kb.hasOwnProperty(a) && (b = Kb[a], delete Kb[a], b.forEach((e) => e()));
        }
        function T(a, b, c = {}) {
          if (!("argPackAdvance" in b))
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          Nb(a, b, c);
        }
        var Ob = (a, b, c) => {
          switch (b) {
            case 1:
              return c ? (d) => g()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];
            case 2:
              return c ? (d) => ba()[d >>> 1 >>> 0] : (d) => da()[d >>> 1 >>> 0];
            case 4:
              return c ? (d) => v()[d >>> 2 >>> 0] : (d) => w()[d >>> 2 >>> 0];
            case 8:
              return c ? (d) => H[d >>> 3] : (d) => Da[d >>> 3];
            default:
              throw new TypeError(`invalid integer width (${b}): ${a}`);
          }
        };
        function Pb() {
          this.mb = [void 0];
          this.Ab = [];
        }
        var U = new Pb();
        function Qb(a) {
          a >>>= 0;
          a >= U.tb && 0 === --U.get(a).Cb && U.yb(a);
        }
        var V = (a) => {
          if (!a)
            throw new S("Cannot use deleted val. handle = " + a);
          return U.get(a).value;
        }, W = (a) => {
          switch (a) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default:
              return U.xb({ Cb: 1, value: a });
          }
        };
        function Rb(a) {
          return this.fromWireType(v()[a >>> 2 >>> 0]);
        }
        var Sb = (a, b) => {
          switch (b) {
            case 4:
              return function(c) {
                var d = this.fromWireType;
                m.buffer != p.buffer && q();
                return d.call(this, Ca[c >>> 2 >>> 0]);
              };
            case 8:
              return function(c) {
                return this.fromWireType(ia()[c >>> 3 >>> 0]);
              };
            default:
              throw new TypeError(`invalid float width (${b}): ${a}`);
          }
        };
        function Tb(a) {
          return this.fromWireType(w()[a >>> 2 >>> 0]);
        }
        var Ub = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Vb = (a, b) => {
          var c = a >> 1;
          for (var d = c + b / 2; !(c >= d) && da()[c >>> 0]; )
            ++c;
          c <<= 1;
          if (32 < c - a && Ub)
            return Ub.decode(t().slice(a, c));
          c = "";
          for (d = 0; !(d >= b / 2); ++d) {
            var e = ba()[a + 2 * d >>> 1 >>> 0];
            if (0 == e)
              break;
            c += String.fromCharCode(e);
          }
          return c;
        }, Wb = (a, b, c) => {
          c ??= 2147483647;
          if (2 > c)
            return 0;
          c -= 2;
          var d = b;
          c = c < 2 * a.length ? c / 2 : a.length;
          for (var e = 0; e < c; ++e) {
            var f = a.charCodeAt(e);
            ba()[b >>> 1 >>> 0] = f;
            b += 2;
          }
          ba()[b >>> 1 >>> 0] = 0;
          return b - d;
        }, Xb = (a) => 2 * a.length, Yb = (a, b) => {
          for (var c = 0, d = ""; !(c >= b / 4); ) {
            var e = v()[a + 4 * c >>> 2 >>> 0];
            if (0 == e)
              break;
            ++c;
            65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
          }
          return d;
        }, Zb = (a, b, c) => {
          b >>>= 0;
          c ??= 2147483647;
          if (4 > c)
            return 0;
          var d = b;
          c = d + c - 4;
          for (var e = 0; e < a.length; ++e) {
            var f = a.charCodeAt(e);
            if (55296 <= f && 57343 >= f) {
              var k = a.charCodeAt(++e);
              f = 65536 + ((f & 1023) << 10) | k & 1023;
            }
            v()[b >>> 2 >>> 0] = f;
            b += 4;
            if (b + 4 > c)
              break;
          }
          v()[b >>> 2 >>> 0] = 0;
          return b - d;
        }, $b = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            55296 <= d && 57343 >= d && ++c;
            b += 4;
          }
          return b;
        };
        function ac(a) {
          a >>>= 0;
          "function" === typeof Atomics.Vb && (Atomics.Vb(v(), a >>> 2, a).value.then(hb), a += 128, Atomics.store(v(), a >>> 2, 1));
        }
        z.__emscripten_thread_mailbox_await = ac;
        var hb = () => {
          var a = gb();
          if (a && (ac(a), a = bc, !Ba))
            try {
              if (a(), !(0 < O))
                try {
                  D ? mb(G) : cb(G);
                } catch (b) {
                  b instanceof Qa || "unwind" == b || oa(1, b);
                }
            } catch (b) {
              b instanceof Qa || "unwind" == b || oa(1, b);
            }
        };
        z.checkMailbox = hb;
        var cc = [], ec = (a, b) => {
          var c = Lb[a];
          if (void 0 === c)
            throw a = dc(a), c = R(a), X(a), new S(b + " has unknown type " + c);
          return c;
        }, fc = (a, b, c) => {
          var d = [];
          a = a.toWireType(d, c);
          d.length && (w()[b >>> 2 >>> 0] = W(d));
          return a;
        }, gc = [], hc = {}, ic = (a) => {
          var b = hc[a];
          return void 0 === b ? R(a) : b;
        }, jc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), kc = (a) => {
          var b = gc.length;
          gc.push(a);
          return b;
        }, lc = (a, b) => {
          for (var c = Array(a), d = 0; d < a; ++d)
            c[d] = ec(w()[b + 4 * d >>> 2 >>> 0], "parameter " + d);
          return c;
        }, nc = (a, b) => Object.defineProperty(
          b,
          "name",
          { value: a }
        );
        function oc(a) {
          var b = Function;
          if (!(b instanceof Function))
            throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
          var c = nc(b.name || "unknownFunctionName", function() {
          });
          c.prototype = b.prototype;
          c = new c();
          a = b.apply(c, a);
          return a instanceof Object ? a : c;
        }
        var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), pc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], qc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function rc(a, b, c, d, e, f, k) {
          return D ? P(16, 1, a, b, c, d, e, f, k) : -52;
        }
        function sc(a, b, c, d, e, f) {
          if (D)
            return P(17, 1, a, b, c, d, e, f);
        }
        var uc = (a) => {
          var b = ub(a) + 1, c = tc(b);
          c && wb(a, c, b);
          return c;
        }, vc = [], wc = {}, yc = () => {
          if (!xc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: na || "./this.program" }, b;
            for (b in wc)
              void 0 === wc[b] ? delete a[b] : a[b] = wc[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            xc = c;
          }
          return xc;
        }, xc;
        function zc(a, b) {
          if (D)
            return P(18, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          yc().forEach((d, e) => {
            var f = b + c;
            e = w()[a + 4 * e >>> 2 >>> 0] = f;
            for (f = 0; f < d.length; ++f)
              g()[e++ >>> 0 >>> 0] = d.charCodeAt(f);
            g()[e >>> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }
        function Ac(a, b) {
          if (D)
            return P(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = yc();
          w()[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((e) => d += e.length + 1);
          w()[b >>> 2 >>> 0] = d;
          return 0;
        }
        function Bc(a) {
          return D ? P(20, 1, a) : 52;
        }
        function Cc(a, b, c, d) {
          return D ? P(21, 1, a, b, c, d) : 52;
        }
        function Dc(a, b, c, d) {
          return D ? P(22, 1, a, b, c, d) : 70;
        }
        var Ec = [null, [], []];
        function Fc(a, b, c, d) {
          if (D)
            return P(23, 1, a, b, c, d);
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var e = 0, f = 0; f < c; f++) {
            var k = w()[b >>> 2 >>> 0], l = w()[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var r = 0; r < l; r++) {
              var n = t()[k + r >>> 0], x = Ec[a];
              0 === n || 10 === n ? ((1 === a ? ya : F)(Va(x, 0)), x.length = 0) : x.push(n);
            }
            e += l;
          }
          w()[d >>> 2 >>> 0] = e;
          return 0;
        }
        var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ic(a) {
          var b = Array(ub(a) + 1);
          vb(a, b, 0, b.length);
          return b;
        }
        var Jc = (a, b) => {
          g().set(a, b >>> 0);
        };
        function Kc(a, b, c, d) {
          function e(h, u, y) {
            for (h = "number" == typeof h ? h.toString() : h || ""; h.length < u; )
              h = y[0] + h;
            return h;
          }
          function f(h, u) {
            return e(h, u, "0");
          }
          function k(h, u) {
            function y(mc) {
              return 0 > mc ? -1 : 0 < mc ? 1 : 0;
            }
            var Q;
            0 === (Q = y(h.getFullYear() - u.getFullYear())) && 0 === (Q = y(h.getMonth() - u.getMonth())) && (Q = y(h.getDate() - u.getDate()));
            return Q;
          }
          function l(h) {
            switch (h.getDay()) {
              case 0:
                return new Date(h.getFullYear() - 1, 11, 29);
              case 1:
                return h;
              case 2:
                return new Date(h.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  h.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(h.getFullYear(), 0, 1);
              case 5:
                return new Date(h.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(h.getFullYear() - 1, 11, 30);
            }
          }
          function r(h) {
            var u = h.qb;
            for (h = new Date(new Date(h.rb + 1900, 0, 1).getTime()); 0 < u; ) {
              var y = h.getMonth(), Q = (Y(h.getFullYear()) ? Gc : Hc)[y];
              if (u > Q - h.getDate())
                u -= Q - h.getDate() + 1, h.setDate(1), 11 > y ? h.setMonth(y + 1) : (h.setMonth(0), h.setFullYear(h.getFullYear() + 1));
              else {
                h.setDate(h.getDate() + u);
                break;
              }
            }
            y = new Date(h.getFullYear() + 1, 0, 4);
            u = l(new Date(
              h.getFullYear(),
              0,
              4
            ));
            y = l(y);
            return 0 >= k(u, h) ? 0 >= k(y, h) ? h.getFullYear() + 1 : h.getFullYear() : h.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var n = w()[d + 40 >>> 2 >>> 0];
          d = { Sb: v()[d >>> 2 >>> 0], Rb: v()[d + 4 >>> 2 >>> 0], ub: v()[d + 8 >>> 2 >>> 0], zb: v()[d + 12 >>> 2 >>> 0], vb: v()[d + 16 >>> 2 >>> 0], rb: v()[d + 20 >>> 2 >>> 0], lb: v()[d + 24 >>> 2 >>> 0], qb: v()[d + 28 >>> 2 >>> 0], Yb: v()[d + 32 >>> 2 >>> 0], Qb: v()[d + 36 >>> 2 >>> 0], Tb: n ? L(n) : "" };
          c = L(c);
          n = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var x in n)
            c = c.replace(new RegExp(x, "g"), n[x]);
          var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");
          n = { "%a": (h) => C[h.lb].substring(0, 3), "%A": (h) => C[h.lb], "%b": (h) => N[h.vb].substring(0, 3), "%B": (h) => N[h.vb], "%C": (h) => f((h.rb + 1900) / 100 | 0, 2), "%d": (h) => f(h.zb, 2), "%e": (h) => e(h.zb, 2, " "), "%g": (h) => r(h).toString().substring(2), "%G": (h) => r(h), "%H": (h) => f(h.ub, 2), "%I": (h) => {
            h = h.ub;
            0 == h ? h = 12 : 12 < h && (h -= 12);
            return f(h, 2);
          }, "%j": (h) => {
            for (var u = 0, y = 0; y <= h.vb - 1; u += (Y(h.rb + 1900) ? Gc : Hc)[y++])
              ;
            return f(h.zb + u, 3);
          }, "%m": (h) => f(h.vb + 1, 2), "%M": (h) => f(h.Rb, 2), "%n": () => "\n", "%p": (h) => 0 <= h.ub && 12 > h.ub ? "AM" : "PM", "%S": (h) => f(h.Sb, 2), "%t": () => "	", "%u": (h) => h.lb || 7, "%U": (h) => f(Math.floor((h.qb + 7 - h.lb) / 7), 2), "%V": (h) => {
            var u = Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7);
            2 >= (h.lb + 371 - h.qb - 2) % 7 && u++;
            if (u)
              53 == u && (y = (h.lb + 371 - h.qb) % 7, 4 == y || 3 == y && Y(h.rb) || (u = 1));
            else {
              u = 52;
              var y = (h.lb + 7 - h.qb - 1) % 7;
              (4 == y || 5 == y && Y(h.rb % 400 - 1)) && u++;
            }
            return f(u, 2);
          }, "%w": (h) => h.lb, "%W": (h) => f(Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7), 2), "%y": (h) => (h.rb + 1900).toString().substring(2), "%Y": (h) => h.rb + 1900, "%z": (h) => {
            h = h.Qb;
            var u = 0 <= h;
            h = Math.abs(h) / 60;
            return (u ? "+" : "-") + String("0000" + (h / 60 * 100 + h % 60)).slice(-4);
          }, "%Z": (h) => h.Tb, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (x in n)
            c.includes(x) && (c = c.replace(new RegExp(x, "g"), n[x](d)));
          c = c.replace(/\0\0/g, "%");
          x = Ic(c);
          if (x.length > b)
            return 0;
          Jc(x, a);
          return x.length - 1;
        }
        M.wb();
        for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)
          Lc[Mc] = String.fromCharCode(Mc);
        Jb = Lc;
        S = z.BindingError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "BindingError";
          }
        };
        z.InternalError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "InternalError";
          }
        };
        Object.assign(Pb.prototype, { get(a) {
          return this.mb[a];
        }, has(a) {
          return void 0 !== this.mb[a];
        }, xb(a) {
          var b = this.Ab.pop() || this.mb.length;
          this.mb[b] = a;
          return b;
        }, yb(a) {
          this.mb[a] = void 0;
          this.Ab.push(a);
        } });
        U.mb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
        U.tb = U.mb.length;
        z.count_emval_handles = () => {
          for (var a = 0, b = U.tb; b < U.mb.length; ++b)
            void 0 !== U.mb[b] && ++a;
          return a;
        };
        var Nc = [ab, bb, qb, sb, tb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, Gb, Hb, rc, sc, zc, Ac, Bc, Cc, Dc, Fc], Qc = {
          b: function(a, b, c) {
            a >>>= 0;
            new nb(a).wb(b >>> 0, c >>> 0);
            ob = a;
            pb++;
            throw ob;
          },
          da: function(a) {
            Oc(a >>> 0, !A, 1, !pa, 131072, false);
            M.Fb();
          },
          D: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : M.Db(M.kb[a]);
          },
          V: rb,
          x: sb,
          ka: tb,
          R: xb,
          T: yb,
          K: zb,
          ia: Ab,
          aa: Bb,
          ga: Cb,
          F: Db,
          S: Eb,
          P: Fb,
          ja: Gb,
          Q: Hb,
          I: function(a, b, c, d, e) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            b = R(b);
            var f = -1 != b.indexOf("u");
            f && (e = (1n << 64n) - 1n);
            T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {
              if ("bigint" != typeof l && "number" != typeof l)
                throw new TypeError(`Cannot convert "${Ib(l)}" to ${this.name}`);
              if (l < d || l > e)
                throw new TypeError(`Passing a number "${Ib(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
              return l;
            }, argPackAdvance: 8, readValueFromPointer: Ob(b, c, !f), sb: null });
          },
          pa: function(a, b, c, d) {
            a >>>= 0;
            b = R(b >>> 0);
            T(a, { name: b, fromWireType: function(e) {
              return !!e;
            }, toWireType: function(e, f) {
              return f ? c : d;
            }, argPackAdvance: 8, readValueFromPointer: function(e) {
              return this.fromWireType(t()[e >>> 0]);
            }, sb: null });
          },
          oa: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            T(a, { name: b, fromWireType: (c) => {
              var d = V(c);
              Qb(c);
              return d;
            }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Rb, sb: null });
          },
          H: function(a, b, c) {
            a >>>= 0;
            c >>>= 0;
            b = R(b >>> 0);
            T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Sb(b, c), sb: null });
          },
          u: function(a, b, c, d, e) {
            a >>>= 0;
            c >>>= 0;
            b = R(b >>> 0);
            -1 === e && (e = 4294967295);
            e = (l) => l;
            if (0 === d) {
              var f = 32 - 8 * c;
              e = (l) => l << f >>> f;
            }
            var k = b.includes("unsigned") ? function(l, r) {
              return r >>> 0;
            } : function(l, r) {
              return r;
            };
            T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Ob(b, c, 0 !== d), sb: null });
          },
          n: function(a, b, c) {
            function d(f) {
              var k = w()[f >>> 2 >>> 0];
              f = w()[f + 4 >>> 2 >>> 0];
              return new e(g().buffer, f, k);
            }
            a >>>= 0;
            var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
            c = R(c >>> 0);
            T(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { Kb: true });
          },
          J: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            var c = "std::string" === b;
            T(a, { name: b, fromWireType: function(d) {
              var e = w()[d >>> 2 >>> 0], f = d + 4;
              if (c)
                for (var k = f, l = 0; l <= e; ++l) {
                  var r = f + l;
                  if (l == e || 0 == t()[r >>> 0]) {
                    k = L(k, r - k);
                    if (void 0 === n)
                      var n = k;
                    else
                      n += String.fromCharCode(0), n += k;
                    k = r + 1;
                  }
                }
              else {
                n = Array(e);
                for (l = 0; l < e; ++l)
                  n[l] = String.fromCharCode(t()[f + l >>> 0]);
                n = n.join("");
              }
              X(d);
              return n;
            }, toWireType: function(d, e) {
              e instanceof ArrayBuffer && (e = new Uint8Array(e));
              var f = "string" == typeof e;
              if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                throw new S("Cannot pass non-string to std::string");
              var k = c && f ? ub(e) : e.length;
              var l = tc(4 + k + 1), r = l + 4;
              w()[l >>> 2 >>> 0] = k;
              if (c && f)
                wb(e, r, k + 1);
              else if (f)
                for (f = 0; f < k; ++f) {
                  var n = e.charCodeAt(f);
                  if (255 < n)
                    throw X(r), new S("String has UTF-16 code units that do not fit in 8 bits");
                  t()[r + f >>> 0] = n;
                }
              else
                for (f = 0; f < k; ++f)
                  t()[r + f >>> 0] = e[f];
              null !== d && d.push(X, l);
              return l;
            }, argPackAdvance: 8, readValueFromPointer: Tb, sb(d) {
              X(d);
            } });
          },
          z: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            c = R(c);
            if (2 === b) {
              var d = Vb;
              var e = Wb;
              var f = Xb;
              var k = () => da();
              var l = 1;
            } else
              4 === b && (d = Yb, e = Zb, f = $b, k = () => w(), l = 2);
            T(a, { name: c, fromWireType: (r) => {
              for (var n = w()[r >>> 2 >>> 0], x = k(), C, N = r + 4, h = 0; h <= n; ++h) {
                var u = r + 4 + h * b;
                if (h == n || 0 == x[u >>> l])
                  N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;
              }
              X(r);
              return C;
            }, toWireType: (r, n) => {
              if ("string" != typeof n)
                throw new S(`Cannot pass non-string to C++ string type ${c}`);
              var x = f(n), C = tc(4 + x + b);
              w()[C >>> 2] = x >> l;
              e(n, C + 4, x + b);
              null !== r && r.push(X, C);
              return C;
            }, argPackAdvance: 8, readValueFromPointer: Rb, sb(r) {
              X(r);
            } });
          },
          qa: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            T(a, {
              Lb: true,
              name: b,
              argPackAdvance: 0,
              fromWireType: () => {
              },
              toWireType: () => {
              }
            });
          },
          na: () => 1,
          N: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => hb()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = M.kb[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          W: function(a, b, c, d) {
            b >>>= 0;
            c /= 2;
            cc.length = c;
            d = d >>> 0 >>> 3;
            for (var e = 0; e < c; e++)
              cc[e] = H[d + 2 * e] ? H[d + 2 * e + 1] : ia()[d + 2 * e + 1 >>> 0];
            a = 0 > a ? Pa[-a - 1] : Nc[a];
            M.Jb = b;
            b = a.apply(null, cc);
            M.Jb = 0;
            return b;
          },
          ca: ac,
          ma: function(a) {
            B && M.kb[a >>> 0].ref();
          },
          s: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = V(a >>> 0);
            b = ec(b, "emval::as");
            return fc(
              b,
              c,
              a
            );
          },
          o: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = gc[a >>> 0];
            b = V(b >>> 0);
            return a(null, b, c, d);
          },
          j: function(a, b, c, d, e) {
            c >>>= 0;
            d >>>= 0;
            e >>>= 0;
            a = gc[a >>> 0];
            b = V(b >>> 0);
            c = ic(c);
            return a(b, b[c], d, e);
          },
          c: Qb,
          A: function(a, b) {
            b >>>= 0;
            a = V(a >>> 0);
            b = V(b);
            return a == b;
          },
          m: function(a) {
            a >>>= 0;
            if (0 === a)
              return W(jc());
            a = ic(a);
            return W(jc()[a]);
          },
          i: function(a, b, c) {
            b = lc(a, b >>> 0);
            var d = b.shift();
            a--;
            var e = "return function (obj, func, destructorsRef, args) {\n", f = 0, k = [];
            0 === c && k.push("obj");
            for (var l = ["retType"], r = [d], n = 0; n < a; ++n)
              k.push("arg" + n), l.push("argType" + n), r.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${f ? "+" + f : ""});
`, f += b[n].argPackAdvance;
            e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});
`;
            for (n = 0; n < a; ++n)
              b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});
`);
            d.Lb || (l.push("emval_returnValue"), r.push(fc), e += "  return emval_returnValue(retType, destructorsRef, rv);\n");
            l.push(e + "};\n");
            a = oc(l).apply(null, r);
            c = `methodCaller<(${b.map((x) => x.name).join(", ")}) => ${d.name}>`;
            return kc(nc(
              c,
              a
            ));
          },
          r: function(a, b) {
            b >>>= 0;
            a = V(a >>> 0);
            b = V(b);
            return W(a[b]);
          },
          d: function(a) {
            a >>>= 0;
            4 < a && (U.get(a).Cb += 1);
          },
          v: function() {
            return W([]);
          },
          l: function(a) {
            a = V(a >>> 0);
            for (var b = Array(a.length), c = 0; c < a.length; c++)
              b[c] = a[c];
            return W(b);
          },
          f: function(a) {
            return W(ic(a >>> 0));
          },
          k: function() {
            return W({});
          },
          h: function(a) {
            a >>>= 0;
            for (var b = V(a); b.length; ) {
              var c = b.pop();
              b.pop()(c);
            }
            Qb(a);
          },
          g: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = V(a >>> 0);
            b = V(b);
            c = V(c);
            a[b] = c;
          },
          e: function(a, b) {
            b >>>= 0;
            a = ec(a >>> 0, "_emval_take_value");
            a = a.readValueFromPointer(b);
            return W(a);
          },
          Z: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            v()[b >>> 2 >>> 0] = a.getUTCSeconds();
            v()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            v()[b + 8 >>> 2 >>> 0] = a.getUTCHours();
            v()[b + 12 >>> 2 >>> 0] = a.getUTCDate();
            v()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
            v()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            v()[b + 24 >>> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            v()[b + 28 >>> 2 >>> 0] = a;
          },
          _: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            v()[b >>> 2 >>> 0] = a.getSeconds();
            v()[b + 4 >>> 2 >>> 0] = a.getMinutes();
            v()[b + 8 >>> 2 >>> 0] = a.getHours();
            v()[b + 12 >>> 2 >>> 0] = a.getDate();
            v()[b + 16 >>> 2 >>> 0] = a.getMonth();
            v()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            v()[b + 24 >>> 2 >>> 0] = a.getDay();
            var c = (Y(a.getFullYear()) ? pc : qc)[a.getMonth()] + a.getDate() - 1 | 0;
            v()[b + 28 >>> 2 >>> 0] = c;
            v()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
            v()[b + 32 >>> 2 >>> 0] = a;
          },
          $: function(a) {
            a >>>= 0;
            var b = new Date(v()[a + 20 >>> 2 >>> 0] + 1900, v()[a + 16 >>> 2 >>> 0], v()[a + 12 >>> 2 >>> 0], v()[a + 8 >>> 2 >>> 0], v()[a + 4 >>> 2 >>> 0], v()[a >>> 2 >>> 0], 0), c = v()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);
            0 > c ? v()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));
            v()[a + 24 >>> 2 >>> 0] = b.getDay();
            c = (Y(b.getFullYear()) ? pc : qc)[b.getMonth()] + b.getDate() - 1 | 0;
            v()[a + 28 >>> 2 >>> 0] = c;
            v()[a >>> 2 >>> 0] = b.getSeconds();
            v()[a + 4 >>> 2 >>> 0] = b.getMinutes();
            v()[a + 8 >>> 2 >>> 0] = b.getHours();
            v()[a + 12 >>> 2 >>> 0] = b.getDate();
            v()[a + 16 >>> 2 >>> 0] = b.getMonth();
            v()[a + 20 >>> 2 >>> 0] = b.getYear();
            a = b.getTime();
            isNaN(a) ? (v()[Pc() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
            return BigInt(a);
          },
          X: rc,
          Y: sc,
          M: function(a, b, c) {
            function d(n) {
              return (n = n.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? n[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(
              e,
              6,
              1
            );
            e = f.getTimezoneOffset();
            var l = k.getTimezoneOffset(), r = Math.max(e, l);
            w()[a >>> 2 >>> 0] = 60 * r;
            v()[b >>> 2 >>> 0] = Number(e != l);
            a = d(f);
            b = d(k);
            a = uc(a);
            b = uc(b);
            l < e ? (w()[c >>> 2 >>> 0] = a, w()[c + 4 >>> 2 >>> 0] = b) : (w()[c >>> 2 >>> 0] = b, w()[c + 4 >>> 2 >>> 0] = a);
          },
          p: () => {
            za("");
          },
          ra: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            vc.length = 0;
            for (var d; d = t()[b++ >>> 0]; ) {
              var e = 105 != d;
              e &= 112 != d;
              c += e && c % 8 ? 4 : 0;
              vc.push(112 == d ? w()[c >>> 2 >>> 0] : 106 == d ? H[c >>> 3] : 105 == d ? v()[c >>> 2 >>> 0] : ia()[c >>> 3 >>> 0]);
              c += e ? 8 : 4;
            }
            return Pa[a].apply(null, vc);
          },
          E: () => {
          },
          G: () => Date.now(),
          la: () => {
            O += 1;
            throw "unwind";
          },
          O: function() {
            return 4294901760;
          },
          t: () => performance.timeOrigin + performance.now(),
          w: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
          L: function(a) {
            a >>>= 0;
            var b = t().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var e = Math;
              d = Math.max(a, d);
              a: {
                e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;
                try {
                  m.grow(e);
                  q();
                  var f = 1;
                  break a;
                } catch (k) {
                }
                f = void 0;
              }
              if (f)
                return true;
            }
            return false;
          },
          ea: zc,
          fa: Ac,
          U: cb,
          y: Bc,
          C: Cc,
          ba: Dc,
          B: Fc,
          a: m || z.wasmMemory,
          ha: Kc,
          q: function(a, b, c, d) {
            return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          }
        }, Z = function() {
          function a(c, d) {
            Z = c.exports;
            Z = Rc();
            M.Gb.push(Z.Ya);
            lb = Z.$a;
            Ga.unshift(Z.sa);
            Aa = d;
            Ja();
            return Z;
          }
          var b = { a: Qc };
          I++;
          if (z.instantiateWasm)
            try {
              return z.instantiateWasm(b, a);
            } catch (c) {
              F(`Module.instantiateWasm callback failed with error: ${c}`), la(c);
            }
          Oa(b, function(c) {
            a(c.instance, c.module);
          }).catch(la);
          return {};
        }();
        z._OrtInit = (a, b) => (z._OrtInit = Z.ta)(a, b);
        z._OrtGetLastError = (a, b) => (z._OrtGetLastError = Z.ua)(a, b);
        z._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, r, n) => (z._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, r, n);
        z._OrtAppendExecutionProvider = (a, b) => (z._OrtAppendExecutionProvider = Z.wa)(a, b);
        z._OrtAddFreeDimensionOverride = (a, b, c) => (z._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);
        z._OrtAddSessionConfigEntry = (a, b, c) => (z._OrtAddSessionConfigEntry = Z.ya)(a, b, c);
        z._OrtReleaseSessionOptions = (a) => (z._OrtReleaseSessionOptions = Z.za)(a);
        z._OrtCreateSession = (a, b, c) => (z._OrtCreateSession = Z.Aa)(a, b, c);
        z._OrtReleaseSession = (a) => (z._OrtReleaseSession = Z.Ba)(a);
        z._OrtGetInputOutputCount = (a, b, c) => (z._OrtGetInputOutputCount = Z.Ca)(a, b, c);
        z._OrtGetInputName = (a, b) => (z._OrtGetInputName = Z.Da)(a, b);
        z._OrtGetOutputName = (a, b) => (z._OrtGetOutputName = Z.Ea)(a, b);
        z._OrtFree = (a) => (z._OrtFree = Z.Fa)(a);
        z._OrtCreateTensor = (a, b, c, d, e, f) => (z._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);
        z._OrtGetTensorData = (a, b, c, d, e) => (z._OrtGetTensorData = Z.Ha)(a, b, c, d, e);
        z._OrtReleaseTensor = (a) => (z._OrtReleaseTensor = Z.Ia)(a);
        z._OrtCreateRunOptions = (a, b, c, d) => (z._OrtCreateRunOptions = Z.Ja)(a, b, c, d);
        z._OrtAddRunConfigEntry = (a, b, c) => (z._OrtAddRunConfigEntry = Z.Ka)(a, b, c);
        z._OrtReleaseRunOptions = (a) => (z._OrtReleaseRunOptions = Z.La)(a);
        z._OrtCreateBinding = (a) => (z._OrtCreateBinding = Z.Ma)(a);
        z._OrtBindInput = (a, b, c) => (z._OrtBindInput = Z.Na)(a, b, c);
        z._OrtBindOutput = (a, b, c, d) => (z._OrtBindOutput = Z.Oa)(a, b, c, d);
        z._OrtClearBoundOutputs = (a) => (z._OrtClearBoundOutputs = Z.Pa)(a);
        z._OrtReleaseBinding = (a) => (z._OrtReleaseBinding = Z.Qa)(a);
        z._OrtRunWithBinding = (a, b, c, d, e) => (z._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);
        z._OrtRun = (a, b, c, d, e, f, k, l) => (z._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);
        z._OrtEndProfiling = (a) => (z._OrtEndProfiling = Z.Ta)(a);
        var Pc = () => (Pc = Z.Ua)(), gb = z._pthread_self = () => (gb = z._pthread_self = Z.Va)(), tc = z._malloc = (a) => (tc = z._malloc = Z.Wa)(a), X = z._free = (a) => (X = z._free = Z.Xa)(a);
        z.__emscripten_tls_init = () => (z.__emscripten_tls_init = Z.Ya)();
        var dc = (a) => (dc = Z.Za)(a);
        z.__embind_initialize_bindings = () => (z.__embind_initialize_bindings = Z._a)();
        var Oc = z.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = z.__emscripten_thread_init = Z.ab)(a, b, c, d, e, f);
        z.__emscripten_thread_crashed = () => (z.__emscripten_thread_crashed = Z.bb)();
        var $a = (a, b, c, d) => ($a = Z.cb)(a, b, c, d), fb = (a) => (fb = Z.db)(a), mb = z.__emscripten_thread_exit = (a) => (mb = z.__emscripten_thread_exit = Z.eb)(a), bc = () => (bc = Z.fb)(), jb = (a, b) => (jb = Z.gb)(a, b), Wa = () => (Wa = Z.hb)(), Xa = (a) => (Xa = Z.ib)(a), Za = (a) => (Za = Z.jb)(a);
        function Rc() {
          var a = Z;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
          a.Ua = b(a.Ua);
          a.Va = b(a.Va);
          a.Wa = c(a.Wa);
          a.Za = c(a.Za);
          a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);
          a.hb = b(a.hb);
          a.jb = c(a.jb);
          return a;
        }
        z.wasmMemory = m;
        z.stackAlloc = Za;
        z.stackSave = Wa;
        z.stackRestore = Xa;
        z.keepRuntimeAlive = () => 0 < O;
        z.UTF8ToString = L;
        z.stringToUTF8 = wb;
        z.lengthBytesUTF8 = ub;
        z.ExitStatus = Qa;
        z.PThread = M;
        var Sc;
        J = function Tc() {
          Sc || Uc();
          Sc || (J = Tc);
        };
        function Uc() {
          if (!(0 < I))
            if (D)
              ka(z), D || ib(Ga), startWorker(z);
            else {
              if (z.preRun)
                for ("function" == typeof z.preRun && (z.preRun = [z.preRun]); z.preRun.length; )
                  Fa.unshift(z.preRun.shift());
              ib(Fa);
              0 < I || Sc || (Sc = true, z.calledRun = true, Ba || (D || ib(Ga), ka(z), D || ib(Ha)));
            }
        }
        Uc();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module2) {
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (true) {
      ortWasmFactory = require_ort_training_wasm_simd();
    } else {
      ortWasmFactory = true ? null : null;
    }
    ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = () => {
      try {
        if (typeof SharedArrayBuffer === "undefined") {
          return false;
        }
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          5,
          4,
          1,
          3,
          1,
          1,
          10,
          11,
          1,
          9,
          0,
          65,
          0,
          254,
          16,
          2,
          0,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          10,
          30,
          1,
          28,
          0,
          65,
          0,
          253,
          15,
          253,
          12,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          253,
          186,
          1,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (true) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = numThreads > 1 && isMultiThreadSupported();
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  require_ort_wasm_threaded_worker()
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (useThreads) {
          config.numThreads = numThreads;
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        factory(config).then(
          // wasm module initialized successfully
          (module2) => {
            initializing = false;
            initialized = true;
            wasm = module2;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";
    dataLocationStringToEnum = (location) => {
      switch (location) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_fs();
    init_promises();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          try {
            return new Uint8Array(await readFile2(file));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e;
          }
        } else {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`failed to load external data file: ${file}`);
          }
          const contentLengthHeader = response.headers.get("Content-Length");
          const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
          if (fileSize < 1073741824) {
            return new Uint8Array(await response.arrayBuffer());
          } else {
            if (!response.body) {
              throw new Error(`failed to load external data file: ${file}, no response body.`);
            }
            const reader = response.body.getReader();
            const pages = Math.ceil(fileSize / 65536);
            const buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
            let offset = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              const chunkSize = value.byteLength;
              const chunk = new Uint8Array(buffer, offset, chunkSize);
              chunk.set(value);
              offset += chunkSize;
            }
            return new Uint8Array(buffer, 0, fileSize);
          }
        }
      } else if (file instanceof Blob) {
        return new Uint8Array(await file.arrayBuffer());
      } else if (file instanceof Uint8Array) {
        return file;
      } else {
        return new Uint8Array(file);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    init_wasm_utils_load_file();
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
    };
    initEp = async (env3, epName) => {
      if (false) {
        if (typeof navigator === "undefined" || !navigator.gpu) {
          throw new Error("WebGPU is not supported in current environment");
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          throw new Error(
            'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
          );
        }
        if (!env3.wasm.simd) {
          throw new Error(
            "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
          );
        }
        const initJsep = null.init;
        await initJsep(getInstance(), env3, adapter);
      }
    };
    activeSessions = /* @__PURE__ */ new Map();
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    copyFromExternalBuffer = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSession = async (modelData, options) => {
      let modelDataOffset, modelDataLength;
      const wasm2 = getInstance();
      if (Array.isArray(modelData)) {
        [modelDataOffset, modelDataLength] = modelData;
      } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
        [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
      } else {
        [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
      }
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
              wasm2.mountExternalData(path, data);
            }));
          }
          await Promise.all(loadingPromises);
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            outputPreferredLocations.push(location);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        wasm2.unmountExternalData?.();
      }
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;
      if (ioBindingState) {
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepUnregisterBuffers?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i]
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
        }
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
    extractTransferableBuffers = (tensors) => {
      const buffers = [];
      for (const tensor of tensors) {
        const data = tensor[2];
        if (!Array.isArray(data) && "buffer" in data) {
          buffers.push(data.buffer);
        }
      }
      return buffers;
    };
  }
});

// proxy-worker:./proxy-worker/main
var require_main = __commonJS({
  "proxy-worker:./proxy-worker/main"(exports, module2) {
    module2.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    createReadStream: () => createReadStream,\n    readFile: () => readFile,\n    readFileSync: () => readFileSync\n  });\n  var readFile, readFileSync, createReadStream;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n      readFileSync = void 0;\n      createReadStream = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var e = moduleArg, k, l;\n          e.ready = new Promise((a, b) => {\n            k = a;\n            l = b;\n          });\n          var aa = Object.assign({}, e), ba = "./this.program", ca = "object" == typeof window, q = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, v = "", x, z, A;\n          if (da) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));\n            v = q ? B.dirname(v) + "/" : __dirname + "/";\n            x = (a, b) => {\n              a = C(a) ? new URL(a) : B.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            A = (a) => {\n              a = x(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            z = (a, b, c, d = true) => {\n              a = C(a) ? new URL(a) : B.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(d ? h.buffer : h);\n              });\n            };\n            !e.thisProgram && 1 < process.argv.length && (ba = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            e.inspect = () => "[Emscripten Module object]";\n          } else if (ca || q)\n            q ? v = self.location.href : "undefined" != typeof document && document.currentScript && (v = document.currentScript.src), _scriptDir && (v = _scriptDir), 0 !== v.indexOf("blob:") ? v = v.substr(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1) : v = "", x = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, q && (A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), z = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            };\n          var ea = console.log.bind(console), D = console.error.bind(console);\n          Object.assign(e, aa);\n          aa = null;\n          "object" != typeof WebAssembly && E("no native wasm support detected");\n          var F, fa = false, G, H, I, J, ha;\n          function ia() {\n            var a = F.buffer;\n            e.HEAP8 = G = new Int8Array(a);\n            e.HEAP16 = new Int16Array(a);\n            e.HEAPU8 = H = new Uint8Array(a);\n            e.HEAPU16 = new Uint16Array(a);\n            e.HEAP32 = I = new Int32Array(a);\n            e.HEAPU32 = J = new Uint32Array(a);\n            e.HEAPF32 = new Float32Array(a);\n            e.HEAPF64 = ha = new Float64Array(a);\n          }\n          var K = [], L = [], ja = [], M = 0, N = null, O = null;\n          function E(a) {\n            a = "Aborted(" + a + ")";\n            D(a);\n            fa = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          var ka = (a) => a.startsWith("data:application/octet-stream;base64,"), C = (a) => a.startsWith("file://"), P;\n          P = "ort-training-wasm-simd.wasm";\n          if (!ka(P)) {\n            var la = P;\n            P = e.locateFile ? e.locateFile(la, v) : v + la;\n          }\n          function ma(a) {\n            if (A)\n              return A(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function na(a) {\n            if (ca || q) {\n              if ("function" == typeof fetch && !C(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => ma(a));\n              if (z)\n                return new Promise((b, c) => {\n                  z(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => ma(a));\n          }\n          function oa(a, b, c) {\n            return na(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              D(`failed to asynchronously prepare wasm: ${d}`);\n              E(d);\n            });\n          }\n          function pa(a, b) {\n            var c = P;\n            return "function" != typeof WebAssembly.instantiateStreaming || ka(c) || C(c) || da || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              D(`wasm streaming compile failed: ${g}`);\n              D("falling back to ArrayBuffer instantiation");\n              return oa(c, a, b);\n            }));\n          }\n          var Q, qa = { 989232: (a, b, c, d) => {\n            if ("undefined" == typeof e || !e.Qa)\n              return 1;\n            a = R(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = e.Qa.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return H.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function ra(a) {\n            this.Ka = a - 24;\n            this.Pa = function(b) {\n              J[this.Ka + 4 >>> 2 >>> 0] = b;\n            };\n            this.Oa = function(b) {\n              J[this.Ka + 8 >>> 2 >>> 0] = b;\n            };\n            this.Ma = function(b, c) {\n              this.Na();\n              this.Pa(b);\n              this.Oa(c);\n            };\n            this.Na = function() {\n              J[this.Ka + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var sa = 0, ta = 0, ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, va = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && ua)\n              return ua.decode(a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, R = (a, b) => (a >>>= 0) ? va(H, a, b) : "", S = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, T = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var r = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | r & 1023;\n              }\n              if (127 >= m) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, U = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ca = (a) => {\n            var b = S(a) + 1, c = Ba(b);\n            c && T(a, H, c, b);\n            return c;\n          }, V = [], W = {}, Da = () => {\n            if (!X) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: ba || "./this.program" }, b;\n              for (b in W)\n                void 0 === W[b] ? delete a[b] : a[b] = W[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              X = c;\n            }\n            return X;\n          }, X, Ea = [null, [], []], Fa = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ga = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ha(a) {\n            var b = Array(S(a) + 1);\n            T(a, b, 0, b.length);\n            return b;\n          }\n          function Ia(a, b, c, d) {\n            function g(f, n, p) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = p[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function m(f, n) {\n              function p(ya) {\n                return 0 > ya ? -1 : 0 < ya ? 1 : 0;\n              }\n              var y;\n              0 === (y = p(f.getFullYear() - n.getFullYear())) && 0 === (y = p(f.getMonth() - n.getMonth())) && (y = p(f.getDate() - n.getDate()));\n              return y;\n            }\n            function r(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function w(f) {\n              var n = f.Ga;\n              for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = f.getMonth(), y = (U(f.getFullYear()) ? Fa : Ga)[p];\n                if (n > y - f.getDate())\n                  n -= y - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(f.getFullYear() + 1, 0, 4);\n              n = r(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              p = r(p);\n              return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var t = J[d + 40 >>> 2 >>> 0];\n            d = { Ta: I[d >>> 2 >>> 0], Sa: I[d + 4 >>> 2 >>> 0], Ia: I[d + 8 >>> 2 >>> 0], La: I[d + 12 >>> 2 >>> 0], Ja: I[d + 16 >>> 2 >>> 0], Ha: I[d + 20 >>> 2 >>> 0], Ba: I[d + 24 >>> 2 >>> 0], Ga: I[d + 28 >>> 2 >>> 0], Va: I[d + 32 >>> 2 >>> 0], Ra: I[d + 36 >>> 2 >>> 0], Ua: t ? R(t) : "" };\n            c = R(c);\n            t = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var u in t)\n              c = c.replace(new RegExp(u, "g"), t[u]);\n            var za = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Aa = "January February March April May June July August September October November December".split(" ");\n            t = {\n              "%a": (f) => za[f.Ba].substring(0, 3),\n              "%A": (f) => za[f.Ba],\n              "%b": (f) => Aa[f.Ja].substring(0, 3),\n              "%B": (f) => Aa[f.Ja],\n              "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2),\n              "%d": (f) => h(f.La, 2),\n              "%e": (f) => g(f.La, 2, " "),\n              "%g": (f) => w(f).toString().substring(2),\n              "%G": (f) => w(f),\n              "%H": (f) => h(f.Ia, 2),\n              "%I": (f) => {\n                f = f.Ia;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return h(f, 2);\n              },\n              "%j": (f) => {\n                for (var n = 0, p = 0; p <= f.Ja - 1; n += (U(f.Ha + 1900) ? Fa : Ga)[p++])\n                  ;\n                return h(f.La + n, 3);\n              },\n              "%m": (f) => h(f.Ja + 1, 2),\n              "%M": (f) => h(f.Sa, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM",\n              "%S": (f) => h(f.Ta, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Ba || 7,\n              "%U": (f) => h(\n                Math.floor((f.Ga + 7 - f.Ba) / 7),\n                2\n              ),\n              "%V": (f) => {\n                var n = Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7);\n                2 >= (f.Ba + 371 - f.Ga - 2) % 7 && n++;\n                if (n)\n                  53 == n && (p = (f.Ba + 371 - f.Ga) % 7, 4 == p || 3 == p && U(f.Ha) || (n = 1));\n                else {\n                  n = 52;\n                  var p = (f.Ba + 7 - f.Ga - 1) % 7;\n                  (4 == p || 5 == p && U(f.Ha % 400 - 1)) && n++;\n                }\n                return h(n, 2);\n              },\n              "%w": (f) => f.Ba,\n              "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Ha + 1900).toString().substring(2),\n              "%Y": (f) => f.Ha + 1900,\n              "%z": (f) => {\n                f = f.Ra;\n                var n = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.Ua,\n              "%%": () => "%"\n            };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (u in t)\n              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            u = Ha(c);\n            if (u.length > b)\n              return 0;\n            G.set(u, a >>> 0);\n            return u.length - 1;\n          }\n          var La = { a: function(a, b, c) {\n            a >>>= 0;\n            new ra(a).Ma(b >>> 0, c >>> 0);\n            sa = a;\n            ta++;\n            throw sa;\n          }, e: function() {\n            return 0;\n          }, H: function() {\n          }, x: function() {\n          }, z: function() {\n          }, J: function() {\n            return 0;\n          }, F: function() {\n          }, A: function() {\n          }, E: function() {\n          }, g: function() {\n          }, y: function() {\n          }, v: function() {\n          }, G: function() {\n          }, w: function() {\n          }, k: () => 1, n: function(a, b, c) {\n            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n            c >>>= 0;\n            a = new Date(1e3 * a);\n            I[c >>> 2 >>> 0] = a.getUTCSeconds();\n            I[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n            I[c + 8 >>> 2 >>> 0] = a.getUTCHours();\n            I[c + 12 >>> 2 >>> 0] = a.getUTCDate();\n            I[c + 16 >>> 2 >>> 0] = a.getUTCMonth();\n            I[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n            I[c + 24 >>> 2 >>> 0] = a.getUTCDay();\n            I[c + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n          }, o: function(a, b, c) {\n            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n            c >>>= 0;\n            a = new Date(1e3 * a);\n            I[c >>> 2 >>> 0] = a.getSeconds();\n            I[c + 4 >>> 2 >>> 0] = a.getMinutes();\n            I[c + 8 >>> 2 >>> 0] = a.getHours();\n            I[c + 12 >>> 2 >>> 0] = a.getDate();\n            I[c + 16 >>> 2 >>> 0] = a.getMonth();\n            I[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n            I[c + 24 >>> 2 >>> 0] = a.getDay();\n            I[c + 28 >>> 2 >>> 0] = (U(a.getFullYear()) ? wa : xa)[a.getMonth()] + a.getDate() - 1 | 0;\n            I[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n            I[c + 32 >>> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n          }, p: function(a) {\n            a >>>= 0;\n            var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n            0 > c ? I[a + 32 >>> 2 >>> 0] = Number(g != h && m == d) : 0 < c != (m == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));\n            I[a + 24 >>> 2 >>> 0] = b.getDay();\n            I[a + 28 >>> 2 >>> 0] = (U(b.getFullYear()) ? wa : xa)[b.getMonth()] + b.getDate() - 1 | 0;\n            I[a >>> 2 >>> 0] = b.getSeconds();\n            I[a + 4 >>> 2 >>> 0] = b.getMinutes();\n            I[a + 8 >>> 2 >>> 0] = b.getHours();\n            I[a + 12 >>> 2 >>> 0] = b.getDate();\n            I[a + 16 >>> 2 >>> 0] = b.getMonth();\n            I[a + 20 >>> 2 >>> 0] = b.getYear();\n            a = b.getTime();\n            isNaN(a) ? (I[Ja() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;\n            return Ka((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n          }, l: function() {\n            return -52;\n          }, m: function() {\n          }, t: function(a, b, c) {\n            function d(w) {\n              return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n            }\n            c >>>= 0;\n            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n            g = h.getTimezoneOffset();\n            var r = m.getTimezoneOffset();\n            J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(g, r);\n            I[b >>> 0 >>> 2 >>> 0] = Number(g != r);\n            a = d(h);\n            b = d(m);\n            a = Ca(a);\n            b = Ca(b);\n            r < g ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);\n          }, d: () => {\n            E("");\n          }, B: function(a, b, c) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            V.length = 0;\n            for (var d; d = H[b++ >>> 0]; ) {\n              var g = 105 != d;\n              g &= 112 != d;\n              c += g && c % 8 ? 4 : 0;\n              V.push(112 == d ? J[c >>> 2 >>> 0] : 105 == d ? I[c >>> 2 >>> 0] : ha[c >>> 3 >>> 0]);\n              c += g ? 8 : 4;\n            }\n            return qa[a].apply(null, V);\n          }, h: () => Date.now(), u: function() {\n            return 4294901760;\n          }, b: () => performance.now(), I: function(a, b, c) {\n            b >>>= 0;\n            return H.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n          }, s: function(a) {\n            a >>>= 0;\n            var b = H.length;\n            if (4294901760 < a)\n              return false;\n            for (var c = 1; 4 >= c; c *= 2) {\n              var d = b * (1 + 0.2 / c);\n              d = Math.min(d, a + 100663296);\n              var g = Math;\n              d = Math.max(a, d);\n              a: {\n                g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - F.buffer.byteLength + 65535) / 65536;\n                try {\n                  F.grow(g);\n                  ia();\n                  var h = 1;\n                  break a;\n                } catch (m) {\n                }\n                h = void 0;\n              }\n              if (h)\n                return true;\n            }\n            return false;\n          }, C: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Da().forEach((d, g) => {\n              var h = b + c;\n              g = J[a + 4 * g >>> 2 >>> 0] = h;\n              for (h = 0; h < d.length; ++h)\n                G[g++ >>> 0 >>> 0] = d.charCodeAt(h);\n              G[g >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }, D: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = Da();\n            J[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((g) => d += g.length + 1);\n            J[b >>> 2 >>> 0] = d;\n            return 0;\n          }, f: () => 52, j: function() {\n            return 52;\n          }, q: function() {\n            return 70;\n          }, i: function(a, b, c, d) {\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var g = 0, h = 0; h < c; h++) {\n              var m = J[b >>> 2 >>> 0], r = J[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var w = 0; w < r; w++) {\n                var t = H[m + w >>> 0], u = Ea[a];\n                0 === t || 10 === t ? ((1 === a ? ea : D)(va(u, 0)), u.length = 0) : u.push(t);\n              }\n              g += r;\n            }\n            J[d >>> 2 >>> 0] = g;\n            return 0;\n          }, r: Ia, c: function(a, b, c, d) {\n            return Ia(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n          } }, Y = function() {\n            function a(c) {\n              Y = c.exports;\n              Y = Ma();\n              F = Y.K;\n              ia();\n              L.unshift(Y.L);\n              M--;\n              0 == M && (null !== N && (clearInterval(N), N = null), O && (c = O, O = null, c()));\n              return Y;\n            }\n            var b = { a: La };\n            M++;\n            if (e.instantiateWasm)\n              try {\n                return e.instantiateWasm(b, a);\n              } catch (c) {\n                D(`Module.instantiateWasm callback failed with error: ${c}`), l(c);\n              }\n            pa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          }();\n          e._OrtInit = (a, b) => (e._OrtInit = Y.M)(a, b);\n          e._OrtGetLastError = (a, b) => (e._OrtGetLastError = Y.N)(a, b);\n          e._OrtCreateSessionOptions = (a, b, c, d, g, h, m, r, w, t) => (e._OrtCreateSessionOptions = Y.O)(a, b, c, d, g, h, m, r, w, t);\n          e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = Y.P)(a, b);\n          e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = Y.Q)(a, b, c);\n          e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = Y.R)(a, b, c);\n          e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = Y.S)(a);\n          e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = Y.T)(a, b, c);\n          e._OrtReleaseSession = (a) => (e._OrtReleaseSession = Y.U)(a);\n          e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = Y.V)(a, b, c);\n          e._OrtGetInputName = (a, b) => (e._OrtGetInputName = Y.W)(a, b);\n          e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = Y.X)(a, b);\n          e._OrtFree = (a) => (e._OrtFree = Y.Y)(a);\n          e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = Y.Z)(a, b, c, d, g, h);\n          e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = Y._)(a, b, c, d, g);\n          e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = Y.$)(a);\n          e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = Y.aa)(a, b, c, d);\n          e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = Y.ba)(a, b, c);\n          e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = Y.ca)(a);\n          e._OrtCreateBinding = (a) => (e._OrtCreateBinding = Y.da)(a);\n          e._OrtBindInput = (a, b, c) => (e._OrtBindInput = Y.ea)(a, b, c);\n          e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = Y.fa)(a, b, c, d);\n          e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = Y.ga)(a);\n          e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = Y.ha)(a);\n          e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = Y.ia)(a, b, c, d, g);\n          e._OrtRun = (a, b, c, d, g, h, m, r) => (e._OrtRun = Y.ja)(a, b, c, d, g, h, m, r);\n          e._OrtEndProfiling = (a) => (e._OrtEndProfiling = Y.ka)(a);\n          e._OrtTrainingLoadCheckpoint = (a, b) => (e._OrtTrainingLoadCheckpoint = Y.la)(a, b);\n          e._OrtTrainingReleaseCheckpoint = (a) => (e._OrtTrainingReleaseCheckpoint = Y.ma)(a);\n          e._OrtTrainingCreateSession = (a, b, c, d, g, h, m, r) => (e._OrtTrainingCreateSession = Y.na)(a, b, c, d, g, h, m, r);\n          e._OrtTrainingLazyResetGrad = (a) => (e._OrtTrainingLazyResetGrad = Y.oa)(a);\n          e._OrtTrainingRunTrainStep = (a, b, c, d, g, h) => (e._OrtTrainingRunTrainStep = Y.pa)(a, b, c, d, g, h);\n          e._OrtTrainingOptimizerStep = (a, b) => (e._OrtTrainingOptimizerStep = Y.qa)(a, b);\n          e._OrtTrainingEvalStep = (a, b, c, d, g, h) => (e._OrtTrainingEvalStep = Y.ra)(a, b, c, d, g, h);\n          e._OrtTrainingGetParametersSize = (a, b, c) => (e._OrtTrainingGetParametersSize = Y.sa)(a, b, c);\n          e._OrtTrainingCopyParametersToBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersToBuffer = Y.ta)(a, b, c, d);\n          e._OrtTrainingCopyParametersFromBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersFromBuffer = Y.ua)(a, b, c, d);\n          e._OrtTrainingGetModelInputOutputCount = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputCount = Y.va)(a, b, c, d);\n          e._OrtTrainingGetModelInputOutputName = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputName = Y.wa)(a, b, c, d);\n          e._OrtTrainingReleaseSession = (a) => (e._OrtTrainingReleaseSession = Y.xa)(a);\n          var Ja = () => (Ja = Y.ya)(), Ba = e._malloc = (a) => (Ba = e._malloc = Y.za)(a);\n          e._free = (a) => (e._free = Y.Aa)(a);\n          var Ka = (a) => (Ka = Y.Ca)(a), Na = () => (Na = Y.Da)(), Oa = (a) => (Oa = Y.Ea)(a), Pa = (a) => (Pa = Y.Fa)(a);\n          function Ma() {\n            var a = Y;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;\n            a.ya = b(a.ya);\n            a.za = c(a.za);\n            a.Da = b(a.Da);\n            a.Fa = c(a.Fa);\n            return a;\n          }\n          e.stackAlloc = Pa;\n          e.stackSave = Na;\n          e.stackRestore = Oa;\n          e.UTF8ToString = R;\n          e.stringToUTF8 = (a, b, c) => T(a, H, b, c);\n          e.lengthBytesUTF8 = S;\n          var Z;\n          O = function Qa() {\n            Z || Ra();\n            Z || (O = Qa);\n          };\n          function Ra() {\n            if (!(0 < M)) {\n              if (e.preRun)\n                for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; ) {\n                  var a = e.preRun.shift();\n                  K.unshift(a);\n                }\n              for (; 0 < K.length; )\n                K.shift()(e);\n              if (!(0 < M || Z || (Z = true, e.calledRun = true, fa))) {\n                for (; 0 < L.length; )\n                  L.shift()(e);\n                for (k(e); 0 < ja.length; )\n                  ja.shift()(e);\n              }\n            }\n          }\n          Ra();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function g() {\n            m.buffer != p.buffer && q();\n            return p;\n          }\n          function t() {\n            m.buffer != p.buffer && q();\n            return aa;\n          }\n          function ba() {\n            m.buffer != p.buffer && q();\n            return ca;\n          }\n          function da() {\n            m.buffer != p.buffer && q();\n            return ea;\n          }\n          function v() {\n            m.buffer != p.buffer && q();\n            return fa;\n          }\n          function w() {\n            m.buffer != p.buffer && q();\n            return ha;\n          }\n          function ia() {\n            m.buffer != p.buffer && q();\n            return ja;\n          }\n          var z = moduleArg, ka, la;\n          z.ready = new Promise((a, b) => {\n            ka = a;\n            la = b;\n          });\n          var ma = Object.assign({}, z), na = "./this.program", oa = (a, b) => {\n            throw b;\n          }, pa = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = z.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function qa(a) {\n            return z.locateFile ? z.locateFile(a, E) : E + a;\n          }\n          var ra, sa, ta;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), ua = (init_path(), __toCommonJS(path_exports));\n            E = A ? ua.dirname(E) + "/" : __dirname + "/";\n            ra = (b, c) => {\n              b = va(b) ? new URL(b) : ua.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            ta = (b) => {\n              b = ra(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            sa = (b, c, d, e = true) => {\n              b = va(b) ? new URL(b) : ua.normalize(b);\n              fs.readFile(b, e ? void 0 : "utf8", (f, k) => {\n                f ? d(f) : c(e ? k.buffer : k);\n              });\n            };\n            !z.thisProgram && 1 < process.argv.length && (na = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            oa = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            z.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (pa || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ra = (a) => {\n              var b = new XMLHttpRequest();\n              b.open(\n                "GET",\n                a,\n                false\n              );\n              b.send(null);\n              return b.responseText;\n            }, A && (ta = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), sa = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var wa = console.log.bind(console), xa = console.error.bind(console);\n          B && (wa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), xa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var ya = wa, F = xa;\n          Object.assign(z, ma);\n          ma = null;\n          "object" != typeof WebAssembly && za("no native wasm support detected");\n          var m, Aa, Ba = false, G, p, aa, ca, ea, fa, ha, Ca, H, Da, ja;\n          function q() {\n            var a = m.buffer;\n            z.HEAP8 = p = new Int8Array(a);\n            z.HEAP16 = ca = new Int16Array(a);\n            z.HEAPU8 = aa = new Uint8Array(a);\n            z.HEAPU16 = ea = new Uint16Array(a);\n            z.HEAP32 = fa = new Int32Array(a);\n            z.HEAPU32 = ha = new Uint32Array(a);\n            z.HEAPF32 = Ca = new Float32Array(a);\n            z.HEAPF64 = ja = new Float64Array(a);\n            z.HEAP64 = H = new BigInt64Array(a);\n            z.HEAPU64 = Da = new BigUint64Array(a);\n          }\n          var Ea = 16777216;\n          if (D)\n            m = z.wasmMemory;\n          else if (z.wasmMemory)\n            m = z.wasmMemory;\n          else if (m = new WebAssembly.Memory({ initial: Ea / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))\n            throw F("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && F("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          q();\n          Ea = m.buffer.byteLength;\n          var Fa = [], Ga = [], Ha = [], I = 0, Ia = null, J = null;\n          function Ja() {\n            I--;\n            if (0 == I && (null !== Ia && (clearInterval(Ia), Ia = null), J)) {\n              var a = J;\n              J = null;\n              a();\n            }\n          }\n          function za(a) {\n            a = "Aborted(" + a + ")";\n            F(a);\n            Ba = true;\n            G = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            la(a);\n            throw a;\n          }\n          var Ka = (a) => a.startsWith("data:application/octet-stream;base64,"), va = (a) => a.startsWith("file://"), K;\n          K = "ort-wasm-threaded.wasm";\n          Ka(K) || (K = qa(K));\n          function La(a) {\n            if (ta)\n              return ta(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ma(a) {\n            if (pa || A) {\n              if ("function" == typeof fetch && !va(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => La(a));\n              if (sa)\n                return new Promise((b, c) => {\n                  sa(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => La(a));\n          }\n          function Na(a, b, c) {\n            return Ma(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              F(`failed to asynchronously prepare wasm: ${d}`);\n              za(d);\n            });\n          }\n          function Oa(a, b) {\n            var c = K;\n            return "function" != typeof WebAssembly.instantiateStreaming || Ka(c) || va(c) || B || "function" != typeof fetch ? Na(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              F(`wasm streaming compile failed: ${e}`);\n              F("falling back to ArrayBuffer instantiation");\n              return Na(c, a, b);\n            }));\n          }\n          var Pa = { 891868: (a, b, c, d) => {\n            if ("undefined" == typeof z || !z.Hb)\n              return 1;\n            a = L(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = z.Hb.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return t().set(a.subarray(b, b + c), d >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function Qa(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Ra = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Ta = (a) => {\n            0 == M.ob.length && (Sa(), M.Bb(M.ob[0]));\n            var b = M.ob.pop();\n            if (!b)\n              return 6;\n            M.pb.push(b);\n            M.kb[a.nb] = b;\n            b.nb = a.nb;\n            var c = { cmd: "run", start_routine: a.Ob, arg: a.Ib, pthread_ptr: a.nb };\n            B && b.unref();\n            b.postMessage(c, a.Ub);\n            return 0;\n          }, O = 0, Ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Va = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ua)\n              return Ua.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var f = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | f);\n                else {\n                  var k = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, L = (a, b) => (a >>>= 0) ? Va(t(), a, b) : "", Ya = (a) => {\n            var b = Wa();\n            a = a();\n            Xa(b);\n            return a;\n          };\n          function P(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return Ya(() => {\n              for (var e = 2 * c, f = Za(8 * e), k = f >>> 3, l = 0; l < c; l++) {\n                var r = d[2 + l];\n                "bigint" == typeof r ? (H[k + 2 * l] = 1n, H[k + 2 * l + 1] = r) : (H[k + 2 * l] = 0n, ia()[k + 2 * l + 1 >>> 0] = r);\n              }\n              return $a(a, e, f, b);\n            });\n          }\n          function ab(a) {\n            if (D)\n              return P(0, 1, a);\n            G = a;\n            0 < O || (M.Pb(), z.onExit?.(a), Ba = true);\n            oa(a, new Qa(a));\n          }\n          var cb = (a) => {\n            G = a;\n            if (D)\n              throw bb(a), "unwind";\n            ab(a);\n          };\n          function db() {\n            for (var a = z.numThreads; a--; )\n              Sa();\n            Fa.unshift(() => {\n              I++;\n              eb(() => Ja());\n            });\n          }\n          function Sa() {\n            var a = qa("ort-wasm-threaded.worker.js");\n            a = new Worker(a);\n            M.ob.push(a);\n          }\n          function eb(a) {\n            D ? a() : Promise.all(M.ob.map(M.Bb)).then(a);\n          }\n          var M = { ob: [], pb: [], Gb: [], kb: {}, wb() {\n            D ? (M.receiveObjectTransfer = M.Nb, M.threadInitTLS = M.Fb, M.setExitStatus = M.Eb) : db();\n          }, Eb: (a) => G = a, Xb: ["$terminateWorker"], Pb: () => {\n            for (var a of M.pb)\n              Ra(a);\n            for (a of M.ob)\n              Ra(a);\n            M.ob = [];\n            M.pb = [];\n            M.kb = [];\n          }, Db: (a) => {\n            var b = a.nb;\n            delete M.kb[b];\n            M.ob.push(a);\n            M.pb.splice(M.pb.indexOf(a), 1);\n            a.nb = 0;\n            fb(b);\n          }, Nb() {\n          }, Fb() {\n            M.Gb.forEach((a) => a());\n          }, Bb: (a) => new Promise((b) => {\n            a.onmessage = (f) => {\n              f = f.data;\n              var k = f.cmd;\n              if (f.targetThread && f.targetThread != gb()) {\n                var l = M.kb[f.targetThread];\n                l ? l.postMessage(f, f.transferList) : F(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === k)\n                hb();\n              else if ("spawnThread" === k)\n                Ta(f);\n              else if ("cleanupThread" === k)\n                M.Db(M.kb[f.thread]);\n              else if ("killThread" === k)\n                f = f.thread, k = M.kb[f], delete M.kb[f], Ra(k), fb(f), M.pb.splice(M.pb.indexOf(k), 1), k.nb = 0;\n              else if ("cancelThread" === k)\n                M.kb[f.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === k)\n                a.loaded = true, B && !a.nb && a.unref(), b(a);\n              else if ("alert" === k)\n                alert(`Thread ${f.threadId}: ${f.text}`);\n              else if ("setimmediate" === f.target)\n                a.postMessage(f);\n              else if ("callHandler" === k)\n                z[f.handler](...f.args);\n              else\n                k && F(`worker sent an unknown command ${k}`);\n            };\n            a.onerror = (f) => {\n              F(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);\n              throw f;\n            };\n            B && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));\n            var c = [], d = ["onExit"], e;\n            for (e of d)\n              z.hasOwnProperty(e) && c.push(e);\n            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: z.mainScriptUrlOrBlob || _scriptDir, wasmMemory: m, wasmModule: Aa });\n          }) };\n          z.PThread = M;\n          var ib = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(z);\n          };\n          z.establishStackSpace = () => {\n            var a = gb(), b = w()[a + 52 >>> 2 >>> 0];\n            a = w()[a + 56 >>> 2 >>> 0];\n            jb(b, b - a);\n            Xa(b);\n          };\n          function bb(a) {\n            if (D)\n              return P(1, 0, a);\n            cb(a);\n          }\n          var kb = [], lb;\n          z.invokeEntryPoint = (a, b) => {\n            var c = kb[a];\n            c || (a >= kb.length && (kb.length = a + 1), kb[a] = c = lb.get(a));\n            a = c(b);\n            0 < O ? M.Eb(a) : mb(a);\n          };\n          function nb(a) {\n            this.tb = a - 24;\n            this.Mb = function(b) {\n              w()[this.tb + 4 >>> 2 >>> 0] = b;\n            };\n            this.yb = function(b) {\n              w()[this.tb + 8 >>> 2 >>> 0] = b;\n            };\n            this.wb = function(b, c) {\n              this.xb();\n              this.Mb(b);\n              this.yb(c);\n            };\n            this.xb = function() {\n              w()[this.tb + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var ob = 0, pb = 0;\n          function qb(a, b, c, d) {\n            return D ? P(2, 1, a, b, c, d) : rb(a, b, c, d);\n          }\n          function rb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return F("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var e = [];\n            if (D && 0 === e.length)\n              return qb(a, b, c, d);\n            a = { Ob: c, nb: a, Ib: d, Ub: e };\n            return D ? (a.Wb = "spawnThread", postMessage(a, e), 0) : Ta(a);\n          }\n          function sb(a, b, c) {\n            return D ? P(3, 1, a, b, c) : 0;\n          }\n          function tb(a, b) {\n            if (D)\n              return P(4, 1, a, b);\n          }\n          var ub = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, vb = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var f = 0; f < a.length; ++f) {\n              var k = a.charCodeAt(f);\n              if (55296 <= k && 57343 >= k) {\n                var l = a.charCodeAt(++f);\n                k = 65536 + ((k & 1023) << 10) | l & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, wb = (a, b, c) => vb(a, t(), b, c);\n          function xb(a, b) {\n            if (D)\n              return P(5, 1, a, b);\n          }\n          function yb(a, b, c) {\n            if (D)\n              return P(6, 1, a, b, c);\n          }\n          function zb(a, b, c) {\n            return D ? P(7, 1, a, b, c) : 0;\n          }\n          function Ab(a, b) {\n            if (D)\n              return P(8, 1, a, b);\n          }\n          function Bb(a, b, c) {\n            if (D)\n              return P(9, 1, a, b, c);\n          }\n          function Cb(a, b, c, d) {\n            if (D)\n              return P(10, 1, a, b, c, d);\n          }\n          function Db(a, b, c, d) {\n            if (D)\n              return P(11, 1, a, b, c, d);\n          }\n          function Eb(a, b, c, d) {\n            if (D)\n              return P(12, 1, a, b, c, d);\n          }\n          function Fb(a) {\n            if (D)\n              return P(13, 1, a);\n          }\n          function Gb(a, b) {\n            if (D)\n              return P(14, 1, a, b);\n          }\n          function Hb(a, b, c) {\n            if (D)\n              return P(15, 1, a, b, c);\n          }\n          var Ib = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Jb, R = (a) => {\n            for (var b = ""; t()[a >>> 0]; )\n              b += Jb[t()[a++ >>> 0]];\n            return b;\n          }, Kb = {}, Lb = {}, Mb = {}, S;\n          function Nb(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new S(`type "${d}" must have a positive integer typeid pointer`);\n            if (Lb.hasOwnProperty(a)) {\n              if (c.Kb)\n                return;\n              throw new S(`Cannot register type \'${d}\' twice`);\n            }\n            Lb[a] = b;\n            delete Mb[a];\n            Kb.hasOwnProperty(a) && (b = Kb[a], delete Kb[a], b.forEach((e) => e()));\n          }\n          function T(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            Nb(a, b, c);\n          }\n          var Ob = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => g()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => ba()[d >>> 1 >>> 0] : (d) => da()[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => v()[d >>> 2 >>> 0] : (d) => w()[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => H[d >>> 3] : (d) => Da[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Pb() {\n            this.mb = [void 0];\n            this.Ab = [];\n          }\n          var U = new Pb();\n          function Qb(a) {\n            a >>>= 0;\n            a >= U.tb && 0 === --U.get(a).Cb && U.yb(a);\n          }\n          var V = (a) => {\n            if (!a)\n              throw new S("Cannot use deleted val. handle = " + a);\n            return U.get(a).value;\n          }, W = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return U.xb({ Cb: 1, value: a });\n            }\n          };\n          function Rb(a) {\n            return this.fromWireType(v()[a >>> 2 >>> 0]);\n          }\n          var Sb = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  var d = this.fromWireType;\n                  m.buffer != p.buffer && q();\n                  return d.call(this, Ca[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(ia()[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function Tb(a) {\n            return this.fromWireType(w()[a >>> 2 >>> 0]);\n          }\n          var Ub = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Vb = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && da()[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && Ub)\n              return Ub.decode(t().slice(a, c));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = ba()[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, Wb = (a, b, c) => {\n            c ??= 2147483647;\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e) {\n              var f = a.charCodeAt(e);\n              ba()[b >>> 1 >>> 0] = f;\n              b += 2;\n            }\n            ba()[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, Xb = (a) => 2 * a.length, Yb = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = v()[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, Zb = (a, b, c) => {\n            b >>>= 0;\n            c ??= 2147483647;\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var f = a.charCodeAt(e);\n              if (55296 <= f && 57343 >= f) {\n                var k = a.charCodeAt(++e);\n                f = 65536 + ((f & 1023) << 10) | k & 1023;\n              }\n              v()[b >>> 2 >>> 0] = f;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            v()[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, $b = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          };\n          function ac(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.Vb && (Atomics.Vb(v(), a >>> 2, a).value.then(hb), a += 128, Atomics.store(v(), a >>> 2, 1));\n          }\n          z.__emscripten_thread_mailbox_await = ac;\n          var hb = () => {\n            var a = gb();\n            if (a && (ac(a), a = bc, !Ba))\n              try {\n                if (a(), !(0 < O))\n                  try {\n                    D ? mb(G) : cb(G);\n                  } catch (b) {\n                    b instanceof Qa || "unwind" == b || oa(1, b);\n                  }\n              } catch (b) {\n                b instanceof Qa || "unwind" == b || oa(1, b);\n              }\n          };\n          z.checkMailbox = hb;\n          var cc = [], ec = (a, b) => {\n            var c = Lb[a];\n            if (void 0 === c)\n              throw a = dc(a), c = R(a), X(a), new S(b + " has unknown type " + c);\n            return c;\n          }, fc = (a, b, c) => {\n            var d = [];\n            a = a.toWireType(d, c);\n            d.length && (w()[b >>> 2 >>> 0] = W(d));\n            return a;\n          }, gc = [], hc = {}, ic = (a) => {\n            var b = hc[a];\n            return void 0 === b ? R(a) : b;\n          }, jc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), kc = (a) => {\n            var b = gc.length;\n            gc.push(a);\n            return b;\n          }, lc = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = ec(w()[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, nc = (a, b) => Object.defineProperty(\n            b,\n            "name",\n            { value: a }\n          );\n          function oc(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = nc(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), pc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], qc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function rc(a, b, c, d, e, f, k) {\n            return D ? P(16, 1, a, b, c, d, e, f, k) : -52;\n          }\n          function sc(a, b, c, d, e, f) {\n            if (D)\n              return P(17, 1, a, b, c, d, e, f);\n          }\n          var uc = (a) => {\n            var b = ub(a) + 1, c = tc(b);\n            c && wb(a, c, b);\n            return c;\n          }, vc = [], wc = {}, yc = () => {\n            if (!xc) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: na || "./this.program" }, b;\n              for (b in wc)\n                void 0 === wc[b] ? delete a[b] : a[b] = wc[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              xc = c;\n            }\n            return xc;\n          }, xc;\n          function zc(a, b) {\n            if (D)\n              return P(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            yc().forEach((d, e) => {\n              var f = b + c;\n              e = w()[a + 4 * e >>> 2 >>> 0] = f;\n              for (f = 0; f < d.length; ++f)\n                g()[e++ >>> 0 >>> 0] = d.charCodeAt(f);\n              g()[e >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ac(a, b) {\n            if (D)\n              return P(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = yc();\n            w()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((e) => d += e.length + 1);\n            w()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Bc(a) {\n            return D ? P(20, 1, a) : 52;\n          }\n          function Cc(a, b, c, d) {\n            return D ? P(21, 1, a, b, c, d) : 52;\n          }\n          function Dc(a, b, c, d) {\n            return D ? P(22, 1, a, b, c, d) : 70;\n          }\n          var Ec = [null, [], []];\n          function Fc(a, b, c, d) {\n            if (D)\n              return P(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var e = 0, f = 0; f < c; f++) {\n              var k = w()[b >>> 2 >>> 0], l = w()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var r = 0; r < l; r++) {\n                var n = t()[k + r >>> 0], x = Ec[a];\n                0 === n || 10 === n ? ((1 === a ? ya : F)(Va(x, 0)), x.length = 0) : x.push(n);\n              }\n              e += l;\n            }\n            w()[d >>> 2 >>> 0] = e;\n            return 0;\n          }\n          var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ic(a) {\n            var b = Array(ub(a) + 1);\n            vb(a, b, 0, b.length);\n            return b;\n          }\n          var Jc = (a, b) => {\n            g().set(a, b >>> 0);\n          };\n          function Kc(a, b, c, d) {\n            function e(h, u, y) {\n              for (h = "number" == typeof h ? h.toString() : h || ""; h.length < u; )\n                h = y[0] + h;\n              return h;\n            }\n            function f(h, u) {\n              return e(h, u, "0");\n            }\n            function k(h, u) {\n              function y(mc) {\n                return 0 > mc ? -1 : 0 < mc ? 1 : 0;\n              }\n              var Q;\n              0 === (Q = y(h.getFullYear() - u.getFullYear())) && 0 === (Q = y(h.getMonth() - u.getMonth())) && (Q = y(h.getDate() - u.getDate()));\n              return Q;\n            }\n            function l(h) {\n              switch (h.getDay()) {\n                case 0:\n                  return new Date(h.getFullYear() - 1, 11, 29);\n                case 1:\n                  return h;\n                case 2:\n                  return new Date(h.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    h.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(h.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(h.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(h.getFullYear() - 1, 11, 30);\n              }\n            }\n            function r(h) {\n              var u = h.qb;\n              for (h = new Date(new Date(h.rb + 1900, 0, 1).getTime()); 0 < u; ) {\n                var y = h.getMonth(), Q = (Y(h.getFullYear()) ? Gc : Hc)[y];\n                if (u > Q - h.getDate())\n                  u -= Q - h.getDate() + 1, h.setDate(1), 11 > y ? h.setMonth(y + 1) : (h.setMonth(0), h.setFullYear(h.getFullYear() + 1));\n                else {\n                  h.setDate(h.getDate() + u);\n                  break;\n                }\n              }\n              y = new Date(h.getFullYear() + 1, 0, 4);\n              u = l(new Date(\n                h.getFullYear(),\n                0,\n                4\n              ));\n              y = l(y);\n              return 0 >= k(u, h) ? 0 >= k(y, h) ? h.getFullYear() + 1 : h.getFullYear() : h.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var n = w()[d + 40 >>> 2 >>> 0];\n            d = { Sb: v()[d >>> 2 >>> 0], Rb: v()[d + 4 >>> 2 >>> 0], ub: v()[d + 8 >>> 2 >>> 0], zb: v()[d + 12 >>> 2 >>> 0], vb: v()[d + 16 >>> 2 >>> 0], rb: v()[d + 20 >>> 2 >>> 0], lb: v()[d + 24 >>> 2 >>> 0], qb: v()[d + 28 >>> 2 >>> 0], Yb: v()[d + 32 >>> 2 >>> 0], Qb: v()[d + 36 >>> 2 >>> 0], Tb: n ? L(n) : "" };\n            c = L(c);\n            n = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var x in n)\n              c = c.replace(new RegExp(x, "g"), n[x]);\n            var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");\n            n = { "%a": (h) => C[h.lb].substring(0, 3), "%A": (h) => C[h.lb], "%b": (h) => N[h.vb].substring(0, 3), "%B": (h) => N[h.vb], "%C": (h) => f((h.rb + 1900) / 100 | 0, 2), "%d": (h) => f(h.zb, 2), "%e": (h) => e(h.zb, 2, " "), "%g": (h) => r(h).toString().substring(2), "%G": (h) => r(h), "%H": (h) => f(h.ub, 2), "%I": (h) => {\n              h = h.ub;\n              0 == h ? h = 12 : 12 < h && (h -= 12);\n              return f(h, 2);\n            }, "%j": (h) => {\n              for (var u = 0, y = 0; y <= h.vb - 1; u += (Y(h.rb + 1900) ? Gc : Hc)[y++])\n                ;\n              return f(h.zb + u, 3);\n            }, "%m": (h) => f(h.vb + 1, 2), "%M": (h) => f(h.Rb, 2), "%n": () => "\\n", "%p": (h) => 0 <= h.ub && 12 > h.ub ? "AM" : "PM", "%S": (h) => f(h.Sb, 2), "%t": () => "	", "%u": (h) => h.lb || 7, "%U": (h) => f(Math.floor((h.qb + 7 - h.lb) / 7), 2), "%V": (h) => {\n              var u = Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7);\n              2 >= (h.lb + 371 - h.qb - 2) % 7 && u++;\n              if (u)\n                53 == u && (y = (h.lb + 371 - h.qb) % 7, 4 == y || 3 == y && Y(h.rb) || (u = 1));\n              else {\n                u = 52;\n                var y = (h.lb + 7 - h.qb - 1) % 7;\n                (4 == y || 5 == y && Y(h.rb % 400 - 1)) && u++;\n              }\n              return f(u, 2);\n            }, "%w": (h) => h.lb, "%W": (h) => f(Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7), 2), "%y": (h) => (h.rb + 1900).toString().substring(2), "%Y": (h) => h.rb + 1900, "%z": (h) => {\n              h = h.Qb;\n              var u = 0 <= h;\n              h = Math.abs(h) / 60;\n              return (u ? "+" : "-") + String("0000" + (h / 60 * 100 + h % 60)).slice(-4);\n            }, "%Z": (h) => h.Tb, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (x in n)\n              c.includes(x) && (c = c.replace(new RegExp(x, "g"), n[x](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            x = Ic(c);\n            if (x.length > b)\n              return 0;\n            Jc(x, a);\n            return x.length - 1;\n          }\n          M.wb();\n          for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)\n            Lc[Mc] = String.fromCharCode(Mc);\n          Jb = Lc;\n          S = z.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          z.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Pb.prototype, { get(a) {\n            return this.mb[a];\n          }, has(a) {\n            return void 0 !== this.mb[a];\n          }, xb(a) {\n            var b = this.Ab.pop() || this.mb.length;\n            this.mb[b] = a;\n            return b;\n          }, yb(a) {\n            this.mb[a] = void 0;\n            this.Ab.push(a);\n          } });\n          U.mb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          U.tb = U.mb.length;\n          z.count_emval_handles = () => {\n            for (var a = 0, b = U.tb; b < U.mb.length; ++b)\n              void 0 !== U.mb[b] && ++a;\n            return a;\n          };\n          var Nc = [ab, bb, qb, sb, tb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, Gb, Hb, rc, sc, zc, Ac, Bc, Cc, Dc, Fc], Qc = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new nb(a).wb(b >>> 0, c >>> 0);\n              ob = a;\n              pb++;\n              throw ob;\n            },\n            da: function(a) {\n              Oc(a >>> 0, !A, 1, !pa, 131072, false);\n              M.Fb();\n            },\n            D: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : M.Db(M.kb[a]);\n            },\n            V: rb,\n            x: sb,\n            ka: tb,\n            R: xb,\n            T: yb,\n            K: zb,\n            ia: Ab,\n            aa: Bb,\n            ga: Cb,\n            F: Db,\n            S: Eb,\n            P: Fb,\n            ja: Gb,\n            Q: Hb,\n            I: function(a, b, c, d, e) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              b = R(b);\n              var f = -1 != b.indexOf("u");\n              f && (e = (1n << 64n) - 1n);\n              T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {\n                if ("bigint" != typeof l && "number" != typeof l)\n                  throw new TypeError(`Cannot convert "${Ib(l)}" to ${this.name}`);\n                if (l < d || l > e)\n                  throw new TypeError(`Passing a number "${Ib(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Ob(b, c, !f), sb: null });\n            },\n            pa: function(a, b, c, d) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: function(e) {\n                return !!e;\n              }, toWireType: function(e, f) {\n                return f ? c : d;\n              }, argPackAdvance: 8, readValueFromPointer: function(e) {\n                return this.fromWireType(t()[e >>> 0]);\n              }, sb: null });\n            },\n            oa: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (c) => {\n                var d = V(c);\n                Qb(c);\n                return d;\n              }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Rb, sb: null });\n            },\n            H: function(a, b, c) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Sb(b, c), sb: null });\n            },\n            u: function(a, b, c, d, e) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              -1 === e && (e = 4294967295);\n              e = (l) => l;\n              if (0 === d) {\n                var f = 32 - 8 * c;\n                e = (l) => l << f >>> f;\n              }\n              var k = b.includes("unsigned") ? function(l, r) {\n                return r >>> 0;\n              } : function(l, r) {\n                return r;\n              };\n              T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Ob(b, c, 0 !== d), sb: null });\n            },\n            n: function(a, b, c) {\n              function d(f) {\n                var k = w()[f >>> 2 >>> 0];\n                f = w()[f + 4 >>> 2 >>> 0];\n                return new e(g().buffer, f, k);\n              }\n              a >>>= 0;\n              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n              c = R(c >>> 0);\n              T(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { Kb: true });\n            },\n            J: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              var c = "std::string" === b;\n              T(a, { name: b, fromWireType: function(d) {\n                var e = w()[d >>> 2 >>> 0], f = d + 4;\n                if (c)\n                  for (var k = f, l = 0; l <= e; ++l) {\n                    var r = f + l;\n                    if (l == e || 0 == t()[r >>> 0]) {\n                      k = L(k, r - k);\n                      if (void 0 === n)\n                        var n = k;\n                      else\n                        n += String.fromCharCode(0), n += k;\n                      k = r + 1;\n                    }\n                  }\n                else {\n                  n = Array(e);\n                  for (l = 0; l < e; ++l)\n                    n[l] = String.fromCharCode(t()[f + l >>> 0]);\n                  n = n.join("");\n                }\n                X(d);\n                return n;\n              }, toWireType: function(d, e) {\n                e instanceof ArrayBuffer && (e = new Uint8Array(e));\n                var f = "string" == typeof e;\n                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                  throw new S("Cannot pass non-string to std::string");\n                var k = c && f ? ub(e) : e.length;\n                var l = tc(4 + k + 1), r = l + 4;\n                w()[l >>> 2 >>> 0] = k;\n                if (c && f)\n                  wb(e, r, k + 1);\n                else if (f)\n                  for (f = 0; f < k; ++f) {\n                    var n = e.charCodeAt(f);\n                    if (255 < n)\n                      throw X(r), new S("String has UTF-16 code units that do not fit in 8 bits");\n                    t()[r + f >>> 0] = n;\n                  }\n                else\n                  for (f = 0; f < k; ++f)\n                    t()[r + f >>> 0] = e[f];\n                null !== d && d.push(X, l);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Tb, sb(d) {\n                X(d);\n              } });\n            },\n            z: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              c = R(c);\n              if (2 === b) {\n                var d = Vb;\n                var e = Wb;\n                var f = Xb;\n                var k = () => da();\n                var l = 1;\n              } else\n                4 === b && (d = Yb, e = Zb, f = $b, k = () => w(), l = 2);\n              T(a, { name: c, fromWireType: (r) => {\n                for (var n = w()[r >>> 2 >>> 0], x = k(), C, N = r + 4, h = 0; h <= n; ++h) {\n                  var u = r + 4 + h * b;\n                  if (h == n || 0 == x[u >>> l])\n                    N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;\n                }\n                X(r);\n                return C;\n              }, toWireType: (r, n) => {\n                if ("string" != typeof n)\n                  throw new S(`Cannot pass non-string to C++ string type ${c}`);\n                var x = f(n), C = tc(4 + x + b);\n                w()[C >>> 2] = x >> l;\n                e(n, C + 4, x + b);\n                null !== r && r.push(X, C);\n                return C;\n              }, argPackAdvance: 8, readValueFromPointer: Rb, sb(r) {\n                X(r);\n              } });\n            },\n            qa: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, {\n                Lb: true,\n                name: b,\n                argPackAdvance: 0,\n                fromWireType: () => {\n                },\n                toWireType: () => {\n                }\n              });\n            },\n            na: () => 1,\n            N: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => hb()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = M.kb[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            W: function(a, b, c, d) {\n              b >>>= 0;\n              c /= 2;\n              cc.length = c;\n              d = d >>> 0 >>> 3;\n              for (var e = 0; e < c; e++)\n                cc[e] = H[d + 2 * e] ? H[d + 2 * e + 1] : ia()[d + 2 * e + 1 >>> 0];\n              a = 0 > a ? Pa[-a - 1] : Nc[a];\n              M.Jb = b;\n              b = a.apply(null, cc);\n              M.Jb = 0;\n              return b;\n            },\n            ca: ac,\n            ma: function(a) {\n              B && M.kb[a >>> 0].ref();\n            },\n            s: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = ec(b, "emval::as");\n              return fc(\n                b,\n                c,\n                a\n              );\n            },\n            o: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = gc[a >>> 0];\n              b = V(b >>> 0);\n              return a(null, b, c, d);\n            },\n            j: function(a, b, c, d, e) {\n              c >>>= 0;\n              d >>>= 0;\n              e >>>= 0;\n              a = gc[a >>> 0];\n              b = V(b >>> 0);\n              c = ic(c);\n              return a(b, b[c], d, e);\n            },\n            c: Qb,\n            A: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return a == b;\n            },\n            m: function(a) {\n              a >>>= 0;\n              if (0 === a)\n                return W(jc());\n              a = ic(a);\n              return W(jc()[a]);\n            },\n            i: function(a, b, c) {\n              b = lc(a, b >>> 0);\n              var d = b.shift();\n              a--;\n              var e = "return function (obj, func, destructorsRef, args) {\\n", f = 0, k = [];\n              0 === c && k.push("obj");\n              for (var l = ["retType"], r = [d], n = 0; n < a; ++n)\n                k.push("arg" + n), l.push("argType" + n), r.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${f ? "+" + f : ""});\n`, f += b[n].argPackAdvance;\n              e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});\n`;\n              for (n = 0; n < a; ++n)\n                b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});\n`);\n              d.Lb || (l.push("emval_returnValue"), r.push(fc), e += "  return emval_returnValue(retType, destructorsRef, rv);\\n");\n              l.push(e + "};\\n");\n              a = oc(l).apply(null, r);\n              c = `methodCaller<(${b.map((x) => x.name).join(", ")}) => ${d.name}>`;\n              return kc(nc(\n                c,\n                a\n              ));\n            },\n            r: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return W(a[b]);\n            },\n            d: function(a) {\n              a >>>= 0;\n              4 < a && (U.get(a).Cb += 1);\n            },\n            v: function() {\n              return W([]);\n            },\n            l: function(a) {\n              a = V(a >>> 0);\n              for (var b = Array(a.length), c = 0; c < a.length; c++)\n                b[c] = a[c];\n              return W(b);\n            },\n            f: function(a) {\n              return W(ic(a >>> 0));\n            },\n            k: function() {\n              return W({});\n            },\n            h: function(a) {\n              a >>>= 0;\n              for (var b = V(a); b.length; ) {\n                var c = b.pop();\n                b.pop()(c);\n              }\n              Qb(a);\n            },\n            g: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              c = V(c);\n              a[b] = c;\n            },\n            e: function(a, b) {\n              b >>>= 0;\n              a = ec(a >>> 0, "_emval_take_value");\n              a = a.readValueFromPointer(b);\n              return W(a);\n            },\n            Z: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              v()[b >>> 2 >>> 0] = a.getUTCSeconds();\n              v()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              v()[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n              v()[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n              v()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              v()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              v()[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              v()[b + 28 >>> 2 >>> 0] = a;\n            },\n            _: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              v()[b >>> 2 >>> 0] = a.getSeconds();\n              v()[b + 4 >>> 2 >>> 0] = a.getMinutes();\n              v()[b + 8 >>> 2 >>> 0] = a.getHours();\n              v()[b + 12 >>> 2 >>> 0] = a.getDate();\n              v()[b + 16 >>> 2 >>> 0] = a.getMonth();\n              v()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              v()[b + 24 >>> 2 >>> 0] = a.getDay();\n              var c = (Y(a.getFullYear()) ? pc : qc)[a.getMonth()] + a.getDate() - 1 | 0;\n              v()[b + 28 >>> 2 >>> 0] = c;\n              v()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n              v()[b + 32 >>> 2 >>> 0] = a;\n            },\n            $: function(a) {\n              a >>>= 0;\n              var b = new Date(v()[a + 20 >>> 2 >>> 0] + 1900, v()[a + 16 >>> 2 >>> 0], v()[a + 12 >>> 2 >>> 0], v()[a + 8 >>> 2 >>> 0], v()[a + 4 >>> 2 >>> 0], v()[a >>> 2 >>> 0], 0), c = v()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);\n              0 > c ? v()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));\n              v()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? pc : qc)[b.getMonth()] + b.getDate() - 1 | 0;\n              v()[a + 28 >>> 2 >>> 0] = c;\n              v()[a >>> 2 >>> 0] = b.getSeconds();\n              v()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              v()[a + 8 >>> 2 >>> 0] = b.getHours();\n              v()[a + 12 >>> 2 >>> 0] = b.getDate();\n              v()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              v()[a + 20 >>> 2 >>> 0] = b.getYear();\n              a = b.getTime();\n              isNaN(a) ? (v()[Pc() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;\n              return BigInt(a);\n            },\n            X: rc,\n            Y: sc,\n            M: function(a, b, c) {\n              function d(n) {\n                return (n = n.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? n[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(\n                e,\n                6,\n                1\n              );\n              e = f.getTimezoneOffset();\n              var l = k.getTimezoneOffset(), r = Math.max(e, l);\n              w()[a >>> 2 >>> 0] = 60 * r;\n              v()[b >>> 2 >>> 0] = Number(e != l);\n              a = d(f);\n              b = d(k);\n              a = uc(a);\n              b = uc(b);\n              l < e ? (w()[c >>> 2 >>> 0] = a, w()[c + 4 >>> 2 >>> 0] = b) : (w()[c >>> 2 >>> 0] = b, w()[c + 4 >>> 2 >>> 0] = a);\n            },\n            p: () => {\n              za("");\n            },\n            ra: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              vc.length = 0;\n              for (var d; d = t()[b++ >>> 0]; ) {\n                var e = 105 != d;\n                e &= 112 != d;\n                c += e && c % 8 ? 4 : 0;\n                vc.push(112 == d ? w()[c >>> 2 >>> 0] : 106 == d ? H[c >>> 3] : 105 == d ? v()[c >>> 2 >>> 0] : ia()[c >>> 3 >>> 0]);\n                c += e ? 8 : 4;\n              }\n              return Pa[a].apply(null, vc);\n            },\n            E: () => {\n            },\n            G: () => Date.now(),\n            la: () => {\n              O += 1;\n              throw "unwind";\n            },\n            O: function() {\n              return 4294901760;\n            },\n            t: () => performance.timeOrigin + performance.now(),\n            w: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            L: function(a) {\n              a >>>= 0;\n              var b = t().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var e = Math;\n                d = Math.max(a, d);\n                a: {\n                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;\n                  try {\n                    m.grow(e);\n                    q();\n                    var f = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  f = void 0;\n                }\n                if (f)\n                  return true;\n              }\n              return false;\n            },\n            ea: zc,\n            fa: Ac,\n            U: cb,\n            y: Bc,\n            C: Cc,\n            ba: Dc,\n            B: Fc,\n            a: m || z.wasmMemory,\n            ha: Kc,\n            q: function(a, b, c, d) {\n              return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            function a(c, d) {\n              Z = c.exports;\n              Z = Rc();\n              M.Gb.push(Z.Ya);\n              lb = Z.$a;\n              Ga.unshift(Z.sa);\n              Aa = d;\n              Ja();\n              return Z;\n            }\n            var b = { a: Qc };\n            I++;\n            if (z.instantiateWasm)\n              try {\n                return z.instantiateWasm(b, a);\n              } catch (c) {\n                F(`Module.instantiateWasm callback failed with error: ${c}`), la(c);\n              }\n            Oa(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(la);\n            return {};\n          }();\n          z._OrtInit = (a, b) => (z._OrtInit = Z.ta)(a, b);\n          z._OrtGetLastError = (a, b) => (z._OrtGetLastError = Z.ua)(a, b);\n          z._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, r, n) => (z._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, r, n);\n          z._OrtAppendExecutionProvider = (a, b) => (z._OrtAppendExecutionProvider = Z.wa)(a, b);\n          z._OrtAddFreeDimensionOverride = (a, b, c) => (z._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);\n          z._OrtAddSessionConfigEntry = (a, b, c) => (z._OrtAddSessionConfigEntry = Z.ya)(a, b, c);\n          z._OrtReleaseSessionOptions = (a) => (z._OrtReleaseSessionOptions = Z.za)(a);\n          z._OrtCreateSession = (a, b, c) => (z._OrtCreateSession = Z.Aa)(a, b, c);\n          z._OrtReleaseSession = (a) => (z._OrtReleaseSession = Z.Ba)(a);\n          z._OrtGetInputOutputCount = (a, b, c) => (z._OrtGetInputOutputCount = Z.Ca)(a, b, c);\n          z._OrtGetInputName = (a, b) => (z._OrtGetInputName = Z.Da)(a, b);\n          z._OrtGetOutputName = (a, b) => (z._OrtGetOutputName = Z.Ea)(a, b);\n          z._OrtFree = (a) => (z._OrtFree = Z.Fa)(a);\n          z._OrtCreateTensor = (a, b, c, d, e, f) => (z._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);\n          z._OrtGetTensorData = (a, b, c, d, e) => (z._OrtGetTensorData = Z.Ha)(a, b, c, d, e);\n          z._OrtReleaseTensor = (a) => (z._OrtReleaseTensor = Z.Ia)(a);\n          z._OrtCreateRunOptions = (a, b, c, d) => (z._OrtCreateRunOptions = Z.Ja)(a, b, c, d);\n          z._OrtAddRunConfigEntry = (a, b, c) => (z._OrtAddRunConfigEntry = Z.Ka)(a, b, c);\n          z._OrtReleaseRunOptions = (a) => (z._OrtReleaseRunOptions = Z.La)(a);\n          z._OrtCreateBinding = (a) => (z._OrtCreateBinding = Z.Ma)(a);\n          z._OrtBindInput = (a, b, c) => (z._OrtBindInput = Z.Na)(a, b, c);\n          z._OrtBindOutput = (a, b, c, d) => (z._OrtBindOutput = Z.Oa)(a, b, c, d);\n          z._OrtClearBoundOutputs = (a) => (z._OrtClearBoundOutputs = Z.Pa)(a);\n          z._OrtReleaseBinding = (a) => (z._OrtReleaseBinding = Z.Qa)(a);\n          z._OrtRunWithBinding = (a, b, c, d, e) => (z._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);\n          z._OrtRun = (a, b, c, d, e, f, k, l) => (z._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);\n          z._OrtEndProfiling = (a) => (z._OrtEndProfiling = Z.Ta)(a);\n          var Pc = () => (Pc = Z.Ua)(), gb = z._pthread_self = () => (gb = z._pthread_self = Z.Va)(), tc = z._malloc = (a) => (tc = z._malloc = Z.Wa)(a), X = z._free = (a) => (X = z._free = Z.Xa)(a);\n          z.__emscripten_tls_init = () => (z.__emscripten_tls_init = Z.Ya)();\n          var dc = (a) => (dc = Z.Za)(a);\n          z.__embind_initialize_bindings = () => (z.__embind_initialize_bindings = Z._a)();\n          var Oc = z.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = z.__emscripten_thread_init = Z.ab)(a, b, c, d, e, f);\n          z.__emscripten_thread_crashed = () => (z.__emscripten_thread_crashed = Z.bb)();\n          var $a = (a, b, c, d) => ($a = Z.cb)(a, b, c, d), fb = (a) => (fb = Z.db)(a), mb = z.__emscripten_thread_exit = (a) => (mb = z.__emscripten_thread_exit = Z.eb)(a), bc = () => (bc = Z.fb)(), jb = (a, b) => (jb = Z.gb)(a, b), Wa = () => (Wa = Z.hb)(), Xa = (a) => (Xa = Z.ib)(a), Za = (a) => (Za = Z.jb)(a);\n          function Rc() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.Ua = b(a.Ua);\n            a.Va = b(a.Va);\n            a.Wa = c(a.Wa);\n            a.Za = c(a.Za);\n            a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);\n            a.hb = b(a.hb);\n            a.jb = c(a.jb);\n            return a;\n          }\n          z.wasmMemory = m;\n          z.stackAlloc = Za;\n          z.stackSave = Wa;\n          z.stackRestore = Xa;\n          z.keepRuntimeAlive = () => 0 < O;\n          z.UTF8ToString = L;\n          z.stringToUTF8 = wb;\n          z.lengthBytesUTF8 = ub;\n          z.ExitStatus = Qa;\n          z.PThread = M;\n          var Sc;\n          J = function Tc() {\n            Sc || Uc();\n            Sc || (J = Tc);\n          };\n          function Uc() {\n            if (!(0 < I))\n              if (D)\n                ka(z), D || ib(Ga), startWorker(z);\n              else {\n                if (z.preRun)\n                  for ("function" == typeof z.preRun && (z.preRun = [z.preRun]); z.preRun.length; )\n                    Fa.unshift(z.preRun.shift());\n                ib(Fa);\n                0 < I || Sc || (Sc = true, z.calledRun = true, Ba || (D || ib(Ga), ka(z), D || ib(Ha)));\n              }\n          }\n          Uc();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        config.numThreads = numThreads;\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  init_fs();\n\n  // nodejs-ignore:node:fs/promises\n  var readFile2 = void 0;\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  var loadFile = async (file) => {\n    if (typeof file === "string") {\n      if (typeof process !== "undefined" && process.versions && process.versions.node) {\n        try {\n          return new Uint8Array(await readFile2(file));\n        } catch (e) {\n          if (e.code === "ERR_FS_FILE_TOO_LARGE") {\n            const stream = createReadStream(file);\n            const chunks = [];\n            for await (const chunk of stream) {\n              chunks.push(chunk);\n            }\n            return new Uint8Array(Buffer.concat(chunks));\n          }\n          throw e;\n        }\n      } else {\n        const response = await fetch(file);\n        if (!response.ok) {\n          throw new Error(`failed to load external data file: ${file}`);\n        }\n        const contentLengthHeader = response.headers.get("Content-Length");\n        const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;\n        if (fileSize < 1073741824) {\n          return new Uint8Array(await response.arrayBuffer());\n        } else {\n          if (!response.body) {\n            throw new Error(`failed to load external data file: ${file}, no response body.`);\n          }\n          const reader = response.body.getReader();\n          const pages = Math.ceil(fileSize / 65536);\n          const buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;\n          let offset = 0;\n          while (true) {\n            const { done, value } = await reader.read();\n            if (done) {\n              break;\n            }\n            const chunkSize = value.byteLength;\n            const chunk = new Uint8Array(buffer, offset, chunkSize);\n            chunk.set(value);\n            offset += chunkSize;\n          }\n          return new Uint8Array(buffer, 0, fileSize);\n        }\n      }\n    } else if (file instanceof Blob) {\n      return new Uint8Array(await file.arrayBuffer());\n    } else if (file instanceof Uint8Array) {\n      return file;\n    } else {\n      return new Uint8Array(file);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n  };\n  var initEp = async (env, epName) => {\n    if (false) {\n      if (typeof navigator === "undefined" || !navigator.gpu) {\n        throw new Error("WebGPU is not supported in current environment");\n      }\n      const adapter = await navigator.gpu.requestAdapter();\n      if (!adapter) {\n        throw new Error(\n          \'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.\'\n        );\n      }\n      if (!env.wasm.simd) {\n        throw new Error(\n          "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"\n        );\n      }\n      const initJsep = null.init;\n      await initJsep(getInstance(), env, adapter);\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var copyFromExternalBuffer = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSession = async (modelData, options) => {\n    let modelDataOffset, modelDataLength;\n    const wasm2 = getInstance();\n    if (Array.isArray(modelData)) {\n      [modelDataOffset, modelDataLength] = modelData;\n    } else if (modelData.buffer === wasm2.HEAPU8.buffer) {\n      [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];\n    } else {\n      [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);\n    }\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      if (options?.externalData && wasm2.mountExternalData) {\n        const loadingPromises = [];\n        for (const file of options.externalData) {\n          const path = typeof file === "string" ? file : file.path;\n          loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {\n            wasm2.mountExternalData(path, data);\n          }));\n        }\n        await Promise.all(loadingPromises);\n      }\n      sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelDataOffset);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      wasm2.unmountExternalData?.();\n    }\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    const { type, in: message } = ev.data;\n    try {\n      switch (type) {\n        case "init-wasm":\n          initializeWebAssembly(message.wasm).then(\n            () => {\n              initRuntime(message).then(\n                () => {\n                  postMessage({ type });\n                },\n                (err) => {\n                  postMessage({ type, err });\n                }\n              );\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        case "init-ep": {\n          const { epName, env } = message;\n          initEp(env, epName).then(\n            () => {\n              postMessage({ type });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "copy-from": {\n          const { buffer } = message;\n          const bufferData = copyFromExternalBuffer(buffer);\n          postMessage({ type, out: bufferData });\n          break;\n        }\n        case "create": {\n          const { model, options } = message;\n          createSession(model, options).then(\n            (sessionMetadata) => {\n              postMessage({ type, out: sessionMetadata });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "release":\n          releaseSession(message);\n          postMessage({ type });\n          break;\n        case "run": {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = message;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type, err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type, out: outputs },\n                  extractTransferableBuffers(outputs)\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "end-profiling":\n          endProfiling(message);\n          postMessage({ type });\n          break;\n        default:\n      }\n    } catch (err) {\n      postMessage({ type, err });\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy1sb2FkLWZpbGUudHMiLCAibm9kZWpzLWlnbm9yZTpub2RlOmZzL3Byb21pc2VzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGU9bW9kdWxlQXJnLGssbDtlLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57az1hO2w9Yn0pO3ZhciBhYT1PYmplY3QuYXNzaWduKHt9LGUpLGJhPVwiLi90aGlzLnByb2dyYW1cIixjYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LHE9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxkYT1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsdj1cIlwiLHgseixBO1xuaWYoZGEpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksQj1yZXF1aXJlKFwicGF0aFwiKTt2PXE/Qi5kaXJuYW1lKHYpK1wiL1wiOl9fZGlybmFtZStcIi9cIjt4PShhLGIpPT57YT1DKGEpP25ldyBVUkwoYSk6Qi5ub3JtYWxpemUoYSk7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhhLGI/dm9pZCAwOlwidXRmOFwiKX07QT1hPT57YT14KGEsITApO2EuYnVmZmVyfHwoYT1uZXcgVWludDhBcnJheShhKSk7cmV0dXJuIGF9O3o9KGEsYixjLGQ9ITApPT57YT1DKGEpP25ldyBVUkwoYSk6Qi5ub3JtYWxpemUoYSk7ZnMucmVhZEZpbGUoYSxkP3ZvaWQgMDpcInV0ZjhcIiwoZyxoKT0+e2c/YyhnKTpiKGQ/aC5idWZmZXI6aCl9KX07IWUudGhpc1Byb2dyYW0mJjE8cHJvY2Vzcy5hcmd2Lmxlbmd0aCYmKGJhPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZS5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihjYXx8cSlxP3Y9XG5zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYodj1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHY9X3NjcmlwdERpciksMCE9PXYuaW5kZXhPZihcImJsb2I6XCIpP3Y9di5zdWJzdHIoMCx2LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnY9XCJcIix4PWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0scSYmKEE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLHo9KGEsYixjKT0+e3ZhciBkPW5ldyBYTUxIdHRwUmVxdWVzdDtkLm9wZW4oXCJHRVRcIixhLCEwKTtkLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtkLm9ubG9hZD0oKT0+ezIwMD09ZC5zdGF0dXN8fDA9PWQuc3RhdHVzJiZkLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9O3ZhciBlYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEQ9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZSxhYSk7YWE9bnVsbDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJkUoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBGLGZhPSExLEcsSCxJLEosaGE7XG5mdW5jdGlvbiBpYSgpe3ZhciBhPUYuYnVmZmVyO2UuSEVBUDg9Rz1uZXcgSW50OEFycmF5KGEpO2UuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2UuSEVBUFU4PUg9bmV3IFVpbnQ4QXJyYXkoYSk7ZS5IRUFQVTE2PW5ldyBVaW50MTZBcnJheShhKTtlLkhFQVAzMj1JPW5ldyBJbnQzMkFycmF5KGEpO2UuSEVBUFUzMj1KPW5ldyBVaW50MzJBcnJheShhKTtlLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtlLkhFQVBGNjQ9aGE9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgSz1bXSxMPVtdLGphPVtdLE09MCxOPW51bGwsTz1udWxsO2Z1bmN0aW9uIEUoYSl7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtEKGEpO2ZhPSEwO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtsKGEpO3Rocm93IGE7fVxudmFyIGthPWE9PmEuc3RhcnRzV2l0aChcImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxcIiksQz1hPT5hLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpLFA7UD1cIm9ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbVwiO2lmKCFrYShQKSl7dmFyIGxhPVA7UD1lLmxvY2F0ZUZpbGU/ZS5sb2NhdGVGaWxlKGxhLHYpOnYrbGF9ZnVuY3Rpb24gbWEoYSl7aWYoQSlyZXR1cm4gQShhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBuYShhKXtpZihjYXx8cSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFDKGEpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9Pm1hKGEpKTtpZih6KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3ooYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5tYShhKSl9ZnVuY3Rpb24gb2EoYSxiLGMpe3JldHVybiBuYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntEKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7RShkKX0pfVxuZnVuY3Rpb24gcGEoYSxiKXt2YXIgYz1QO3JldHVyblwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxrYShjKXx8QyhjKXx8ZGF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP29hKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGQsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0QoYHdhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiAke2d9YCk7RChcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBvYShjLGEsYil9KSl9XG52YXIgUSxxYT17OTg5MjMyOihhLGIsYyxkKT0+e2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBlfHwhZS5RYSlyZXR1cm4gMTthPVIoYT4+PjApO2Euc3RhcnRzV2l0aChcIi4vXCIpJiYoYT1hLnN1YnN0cmluZygyKSk7YT1lLlFhLmdldChhKTtpZighYSlyZXR1cm4gMjtiPj4+PTA7Yz4+Pj0wO2lmKGIrYz5hLmJ5dGVMZW5ndGgpcmV0dXJuIDM7dHJ5e3JldHVybiBILnNldChhLnN1YmFycmF5KGIsYitjKSxkPj4+MD4+PjApLDB9Y2F0Y2h7cmV0dXJuIDR9fX07ZnVuY3Rpb24gcmEoYSl7dGhpcy5LYT1hLTI0O3RoaXMuUGE9ZnVuY3Rpb24oYil7Slt0aGlzLkthKzQ+Pj4yPj4+MF09Yn07dGhpcy5PYT1mdW5jdGlvbihiKXtKW3RoaXMuS2ErOD4+PjI+Pj4wXT1ifTt0aGlzLk1hPWZ1bmN0aW9uKGIsYyl7dGhpcy5OYSgpO3RoaXMuUGEoYik7dGhpcy5PYShjKX07dGhpcy5OYT1mdW5jdGlvbigpe0pbdGhpcy5LYSsxNj4+PjI+Pj4wXT0wfX1cbnZhciBzYT0wLHRhPTAsdWE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHZhPShhLGIsYyk9PntiPj4+PTA7dmFyIGQ9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1kKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnVhKXJldHVybiB1YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZD1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBtPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8bTooZyY3KTw8MTh8aDw8MTJ8bTw8NnxhW2IrK10mNjM7NjU1MzY+Zz9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGR9LFxuUj0oYSxiKT0+KGE+Pj49MCk/dmEoSCxhLGIpOlwiXCIsUz1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVD0oYSxiLGMsZCk9PntjPj4+PTA7aWYoISgwPGQpKXJldHVybiAwO3ZhciBnPWM7ZD1jK2QtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIG09YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1tJiY1NzM0Mz49bSl7dmFyIHI9YS5jaGFyQ29kZUF0KCsraCk7bT02NTUzNisoKG0mMTAyMyk8PDEwKXxyJjEwMjN9aWYoMTI3Pj1tKXtpZihjPj1kKWJyZWFrO2JbYysrPj4+MF09bX1lbHNle2lmKDIwNDc+PW0pe2lmKGMrMT49ZClicmVhaztiW2MrKz4+PjBdPTE5MnxtPj42fWVsc2V7aWYoNjU1MzU+PW0pe2lmKGMrMj49ZClicmVhaztiW2MrKz4+PjBdPTIyNHxtPj4xMn1lbHNle2lmKGMrMz49XG5kKWJyZWFrO2JbYysrPj4+MF09MjQwfG0+PjE4O2JbYysrPj4+MF09MTI4fG0+PjEyJjYzfWJbYysrPj4+MF09MTI4fG0+PjYmNjN9YltjKys+Pj4wXT0xMjh8bSY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxVPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksd2E9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0seGE9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sQ2E9YT0+e3ZhciBiPVMoYSkrMSxjPUJhKGIpO2MmJlQoYSxILGMsYik7cmV0dXJuIGN9LFY9W10sVz17fSxEYT0oKT0+e2lmKCFYKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXG5cIl9cIikrXCIuVVRGLThcIixfOmJhfHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gVyl2b2lkIDA9PT1XW2JdP2RlbGV0ZSBhW2JdOmFbYl09V1tiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WD1jfXJldHVybiBYfSxYLEVhPVtudWxsLFtdLFtdXSxGYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEdhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gSGEoYSl7dmFyIGI9QXJyYXkoUyhhKSsxKTtUKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIElhKGEsYixjLGQpe2Z1bmN0aW9uIGcoZixuLHApe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPG47KWY9cFswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixuKXtyZXR1cm4gZyhmLG4sXCIwXCIpfWZ1bmN0aW9uIG0oZixuKXtmdW5jdGlvbiBwKHlhKXtyZXR1cm4gMD55YT8tMTowPHlhPzE6MH12YXIgeTswPT09KHk9cChmLmdldEZ1bGxZZWFyKCktbi5nZXRGdWxsWWVhcigpKSkmJjA9PT0oeT1wKGYuZ2V0TW9udGgoKS1uLmdldE1vbnRoKCkpKSYmKHk9cChmLmdldERhdGUoKS1uLmdldERhdGUoKSkpO3JldHVybiB5fWZ1bmN0aW9uIHIoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiB3KGYpe3ZhciBuPWYuR2E7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuSGErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8bjspe3ZhciBwPWYuZ2V0TW9udGgoKSx5PShVKGYuZ2V0RnVsbFllYXIoKSk/RmE6R2EpW3BdO2lmKG4+eS1mLmdldERhdGUoKSluLT15LWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnA/Zi5zZXRNb250aChwKzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStuKTticmVha319cD1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO249cihuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTtwPXIocCk7cmV0dXJuIDA+PW0obixmKT8wPj1tKHAsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgdD1KW2QrNDA+Pj4yPj4+MF07ZD17VGE6SVtkPj4+Mj4+PjBdLFNhOklbZCs0Pj4+Mj4+PjBdLElhOklbZCs4Pj4+Mj4+PjBdLExhOklbZCsxMj4+PjI+Pj4wXSxKYTpJW2QrMTY+Pj4yPj4+MF0sSGE6SVtkKzIwPj4+Mj4+PjBdLEJhOklbZCsyND4+PjI+Pj4wXSxHYTpJW2QrMjg+Pj4yPj4+MF0sVmE6SVtkKzMyPj4+Mj4+PjBdLFJhOklbZCszNj4+PjI+Pj4wXSxVYTp0P1IodCk6XCJcIn07Yz1SKGMpO3Q9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFxuXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdSBpbiB0KWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodSxcImdcIiksdFt1XSk7dmFyIHphPVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksQWE9XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3Q9e1wiJWFcIjpmPT56YVtmLkJhXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+emFbZi5CYV0sXG5cIiViXCI6Zj0+QWFbZi5KYV0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmY9PkFhW2YuSmFdLFwiJUNcIjpmPT5oKChmLkhhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5oKGYuTGEsMiksXCIlZVwiOmY9PmcoZi5MYSwyLFwiIFwiKSxcIiVnXCI6Zj0+dyhmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+dyhmKSxcIiVIXCI6Zj0+aChmLklhLDIpLFwiJUlcIjpmPT57Zj1mLklhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBoKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciBuPTAscD0wO3A8PWYuSmEtMTtuKz0oVShmLkhhKzE5MDApP0ZhOkdhKVtwKytdKTtyZXR1cm4gaChmLkxhK24sMyl9LFwiJW1cIjpmPT5oKGYuSmErMSwyKSxcIiVNXCI6Zj0+aChmLlNhLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5JYSYmMTI+Zi5JYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5oKGYuVGEsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLkJhfHw3LFwiJVVcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy1mLkJhKS83KSxcbjIpLFwiJVZcIjpmPT57dmFyIG49TWF0aC5mbG9vcigoZi5HYSs3LShmLkJhKzYpJTcpLzcpOzI+PShmLkJhKzM3MS1mLkdhLTIpJTcmJm4rKztpZihuKTUzPT1uJiYocD0oZi5CYSszNzEtZi5HYSklNyw0PT1wfHwzPT1wJiZVKGYuSGEpfHwobj0xKSk7ZWxzZXtuPTUyO3ZhciBwPShmLkJhKzctZi5HYS0xKSU3Oyg0PT1wfHw1PT1wJiZVKGYuSGElNDAwLTEpKSYmbisrfXJldHVybiBoKG4sMil9LFwiJXdcIjpmPT5mLkJhLFwiJVdcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy0oZi5CYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuSGErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuSGErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5SYTt2YXIgbj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKG4/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYuVWEsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO1xuZm9yKHUgaW4gdCljLmluY2x1ZGVzKHUpJiYoYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh1LFwiZ1wiKSx0W3VdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt1PUhhKGMpO2lmKHUubGVuZ3RoPmIpcmV0dXJuIDA7Ry5zZXQodSxhPj4+MCk7cmV0dXJuIHUubGVuZ3RoLTF9XG52YXIgTGE9e2E6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IHJhKGEpKS5NYShiPj4+MCxjPj4+MCk7c2E9YTt0YSsrO3Rocm93IHNhO30sZTpmdW5jdGlvbigpe3JldHVybiAwfSxIOmZ1bmN0aW9uKCl7fSx4OmZ1bmN0aW9uKCl7fSx6OmZ1bmN0aW9uKCl7fSxKOmZ1bmN0aW9uKCl7cmV0dXJuIDB9LEY6ZnVuY3Rpb24oKXt9LEE6ZnVuY3Rpb24oKXt9LEU6ZnVuY3Rpb24oKXt9LGc6ZnVuY3Rpb24oKXt9LHk6ZnVuY3Rpb24oKXt9LHY6ZnVuY3Rpb24oKXt9LEc6ZnVuY3Rpb24oKXt9LHc6ZnVuY3Rpb24oKXt9LGs6KCk9PjEsbjpmdW5jdGlvbihhLGIsYyl7YT1iKzIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOk5hTjtjPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7SVtjPj4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO0lbYys0Pj4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0lbYys4Pj4+Mj4+PjBdPWEuZ2V0VVRDSG91cnMoKTtJW2MrMTI+Pj5cbjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTtJW2MrMTY+Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0lbYysyMD4+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDtJW2MrMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTtJW2MrMjg+Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LG86ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0lbYz4+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTtJW2MrND4+PjI+Pj4wXT1hLmdldE1pbnV0ZXMoKTtJW2MrOD4+PjI+Pj4wXT1hLmdldEhvdXJzKCk7SVtjKzEyPj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO0lbYysxNj4+PjI+Pj4wXT1hLmdldE1vbnRoKCk7SVtjKzIwPj4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0lbYysyND4+PjI+Pj4wXT1hLmdldERheSgpO1xuSVtjKzI4Pj4+Mj4+PjBdPShVKGEuZ2V0RnVsbFllYXIoKSk/d2E6eGEpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0lbYyszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0lbYyszMj4+PjI+Pj4wXT0oYiE9ZCYmYS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihkLGIpKXwwfSxwOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uZXcgRGF0ZShJW2ErMjA+Pj4yPj4+MF0rMTkwMCxJW2ErMTY+Pj4yPj4+MF0sSVthKzEyPj4+Mj4+PjBdLElbYSs4Pj4+Mj4+PjBdLElbYSs0Pj4+Mj4+PjBdLElbYT4+PjI+Pj4wXSwwKSxjPUlbYSszMj4+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbmg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLG09TWF0aC5taW4oaCxnKTswPmM/SVthKzMyPj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1kKTowPGMhPShtPT1kKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZCkpKTtJW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtJW2ErMjg+Pj4yPj4+MF09KFUoYi5nZXRGdWxsWWVhcigpKT93YTp4YSlbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7SVthPj4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0lbYSs0Pj4+Mj4+PjBdPWIuZ2V0TWludXRlcygpO0lbYSs4Pj4+Mj4+PjBdPWIuZ2V0SG91cnMoKTtJW2ErMTI+Pj4yPj4+MF09Yi5nZXREYXRlKCk7SVthKzE2Pj4+Mj4+PjBdPWIuZ2V0TW9udGgoKTtJW2ErMjA+Pj4yPj4+MF09Yi5nZXRZZWFyKCk7YT1iLmdldFRpbWUoKTtpc05hTihhKT8oSVtKYSgpPj4+Mj4+PjBdPTYxLGE9LTEpOlxuYS89MUUzO3JldHVybiBLYSgoUT1hLDE8PStNYXRoLmFicyhRKT8wPFE/K01hdGguZmxvb3IoUS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKChRLSsofn5RPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKSksYT4+PjB9LGw6ZnVuY3Rpb24oKXtyZXR1cm4tNTJ9LG06ZnVuY3Rpb24oKXt9LHQ6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQodyl7cmV0dXJuKHc9dy50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT93WzFdOlwiR01UXCJ9Yz4+Pj0wO3ZhciBnPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxoPW5ldyBEYXRlKGcsMCwxKSxtPW5ldyBEYXRlKGcsNiwxKTtnPWguZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgcj1tLmdldFRpbWV6b25lT2Zmc2V0KCk7SlthPj4+MD4+PjI+Pj4wXT02MCpNYXRoLm1heChnLHIpO0lbYj4+PjA+Pj4yPj4+MF09TnVtYmVyKGchPXIpO2E9ZChoKTtiPWQobSk7YT1DYShhKTtiPUNhKGIpO3I8Zz8oSltjPj4+Mj4+PjBdPVxuYSxKW2MrND4+PjI+Pj4wXT1iKTooSltjPj4+Mj4+PjBdPWIsSltjKzQ+Pj4yPj4+MF09YSl9LGQ6KCk9PntFKFwiXCIpfSxCOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtWLmxlbmd0aD0wO2Zvcih2YXIgZDtkPUhbYisrPj4+MF07KXt2YXIgZz0xMDUhPWQ7ZyY9MTEyIT1kO2MrPWcmJmMlOD80OjA7Vi5wdXNoKDExMj09ZD9KW2M+Pj4yPj4+MF06MTA1PT1kP0lbYz4+PjI+Pj4wXTpoYVtjPj4+Mz4+PjBdKTtjKz1nPzg6NH1yZXR1cm4gcWFbYV0uYXBwbHkobnVsbCxWKX0saDooKT0+RGF0ZS5ub3coKSx1OmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LGI6KCk9PnBlcmZvcm1hbmNlLm5vdygpLEk6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtyZXR1cm4gSC5jb3B5V2l0aGluKGE+Pj4wPj4+MCxiPj4+MCxiKyhjPj4+MCk+Pj4wKX0sczpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9SC5sZW5ndGg7aWYoNDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz1cbjE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGc9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7Zz0oZy5taW4uY2FsbChnLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLUYuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXtGLmdyb3coZyk7aWEoKTt2YXIgaD0xO2JyZWFrIGF9Y2F0Y2gobSl7fWg9dm9pZCAwfWlmKGgpcmV0dXJuITB9cmV0dXJuITF9LEM6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPTA7RGEoKS5mb3JFYWNoKChkLGcpPT57dmFyIGg9YitjO2c9SlthKzQqZz4+PjI+Pj4wXT1oO2ZvcihoPTA7aDxkLmxlbmd0aDsrK2gpR1tnKys+Pj4wPj4+MF09ZC5jaGFyQ29kZUF0KGgpO0dbZz4+PjA+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH0sRDpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9RGEoKTtKW2E+Pj4yPj4+MF09Yy5sZW5ndGg7dmFyIGQ9XG4wO2MuZm9yRWFjaChnPT5kKz1nLmxlbmd0aCsxKTtKW2I+Pj4yPj4+MF09ZDtyZXR1cm4gMH0sZjooKT0+NTIsajpmdW5jdGlvbigpe3JldHVybiA1Mn0scTpmdW5jdGlvbigpe3JldHVybiA3MH0saTpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGc9MCxoPTA7aDxjO2grKyl7dmFyIG09SltiPj4+Mj4+PjBdLHI9SltiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIHc9MDt3PHI7dysrKXt2YXIgdD1IW20rdz4+PjBdLHU9RWFbYV07MD09PXR8fDEwPT09dD8oKDE9PT1hP2VhOkQpKHZhKHUsMCkpLHUubGVuZ3RoPTApOnUucHVzaCh0KX1nKz1yfUpbZD4+PjI+Pj4wXT1nO3JldHVybiAwfSxyOklhLGM6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIElhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGMpe1k9Yy5leHBvcnRzO1k9TWEoKTtGPVkuSztpYSgpO0wudW5zaGlmdChZLkwpO00tLTswPT1NJiYobnVsbCE9PVxuTiYmKGNsZWFySW50ZXJ2YWwoTiksTj1udWxsKSxPJiYoYz1PLE89bnVsbCxjKCkpKTtyZXR1cm4gWX12YXIgYj17YTpMYX07TSsrO2lmKGUuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZS5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtEKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCksbChjKX1wYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSl9KS5jYXRjaChsKTtyZXR1cm57fX0oKTtlLl9PcnRJbml0PShhLGIpPT4oZS5fT3J0SW5pdD1ZLk0pKGEsYik7ZS5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4oZS5fT3J0R2V0TGFzdEVycm9yPVkuTikoYSxiKTtlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsbSxyLHcsdCk9PihlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1ZLk8pKGEsYixjLGQsZyxoLG0scix3LHQpO1xuZS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihlLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1ZLlApKGEsYik7ZS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihlLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9WS5RKShhLGIsYyk7ZS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihlLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9WS5SKShhLGIsYyk7ZS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9WS5TKShhKTtlLl9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9PihlLl9PcnRDcmVhdGVTZXNzaW9uPVkuVCkoYSxiLGMpO2UuX09ydFJlbGVhc2VTZXNzaW9uPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbj1ZLlUpKGEpO2UuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KGUuX09ydEdldElucHV0T3V0cHV0Q291bnQ9WS5WKShhLGIsYyk7XG5lLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihlLl9PcnRHZXRJbnB1dE5hbWU9WS5XKShhLGIpO2UuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihlLl9PcnRHZXRPdXRwdXROYW1lPVkuWCkoYSxiKTtlLl9PcnRGcmVlPWE9PihlLl9PcnRGcmVlPVkuWSkoYSk7ZS5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxkLGcsaCk9PihlLl9PcnRDcmVhdGVUZW5zb3I9WS5aKShhLGIsYyxkLGcsaCk7ZS5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZCxnKT0+KGUuX09ydEdldFRlbnNvckRhdGE9WS5fKShhLGIsYyxkLGcpO2UuX09ydFJlbGVhc2VUZW5zb3I9YT0+KGUuX09ydFJlbGVhc2VUZW5zb3I9WS4kKShhKTtlLl9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KGUuX09ydENyZWF0ZVJ1bk9wdGlvbnM9WS5hYSkoYSxiLGMsZCk7ZS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KGUuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVkuYmEpKGEsYixjKTtcbmUuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9PihlLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1ZLmNhKShhKTtlLl9PcnRDcmVhdGVCaW5kaW5nPWE9PihlLl9PcnRDcmVhdGVCaW5kaW5nPVkuZGEpKGEpO2UuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4oZS5fT3J0QmluZElucHV0PVkuZWEpKGEsYixjKTtlLl9PcnRCaW5kT3V0cHV0PShhLGIsYyxkKT0+KGUuX09ydEJpbmRPdXRwdXQ9WS5mYSkoYSxiLGMsZCk7ZS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KGUuX09ydENsZWFyQm91bmRPdXRwdXRzPVkuZ2EpKGEpO2UuX09ydFJlbGVhc2VCaW5kaW5nPWE9PihlLl9PcnRSZWxlYXNlQmluZGluZz1ZLmhhKShhKTtlLl9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxnKT0+KGUuX09ydFJ1bldpdGhCaW5kaW5nPVkuaWEpKGEsYixjLGQsZyk7ZS5fT3J0UnVuPShhLGIsYyxkLGcsaCxtLHIpPT4oZS5fT3J0UnVuPVkuamEpKGEsYixjLGQsZyxoLG0scik7XG5lLl9PcnRFbmRQcm9maWxpbmc9YT0+KGUuX09ydEVuZFByb2ZpbGluZz1ZLmthKShhKTtlLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PShhLGIpPT4oZS5fT3J0VHJhaW5pbmdMb2FkQ2hlY2twb2ludD1ZLmxhKShhLGIpO2UuX09ydFRyYWluaW5nUmVsZWFzZUNoZWNrcG9pbnQ9YT0+KGUuX09ydFRyYWluaW5nUmVsZWFzZUNoZWNrcG9pbnQ9WS5tYSkoYSk7ZS5fT3J0VHJhaW5pbmdDcmVhdGVTZXNzaW9uPShhLGIsYyxkLGcsaCxtLHIpPT4oZS5fT3J0VHJhaW5pbmdDcmVhdGVTZXNzaW9uPVkubmEpKGEsYixjLGQsZyxoLG0scik7ZS5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPWE9PihlLl9PcnRUcmFpbmluZ0xhenlSZXNldEdyYWQ9WS5vYSkoYSk7ZS5fT3J0VHJhaW5pbmdSdW5UcmFpblN0ZXA9KGEsYixjLGQsZyxoKT0+KGUuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPVkucGEpKGEsYixjLGQsZyxoKTtcbmUuX09ydFRyYWluaW5nT3B0aW1pemVyU3RlcD0oYSxiKT0+KGUuX09ydFRyYWluaW5nT3B0aW1pemVyU3RlcD1ZLnFhKShhLGIpO2UuX09ydFRyYWluaW5nRXZhbFN0ZXA9KGEsYixjLGQsZyxoKT0+KGUuX09ydFRyYWluaW5nRXZhbFN0ZXA9WS5yYSkoYSxiLGMsZCxnLGgpO2UuX09ydFRyYWluaW5nR2V0UGFyYW1ldGVyc1NpemU9KGEsYixjKT0+KGUuX09ydFRyYWluaW5nR2V0UGFyYW1ldGVyc1NpemU9WS5zYSkoYSxiLGMpO2UuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj0oYSxiLGMsZCk9PihlLl9PcnRUcmFpbmluZ0NvcHlQYXJhbWV0ZXJzVG9CdWZmZXI9WS50YSkoYSxiLGMsZCk7ZS5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc0Zyb21CdWZmZXI9KGEsYixjLGQpPT4oZS5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc0Zyb21CdWZmZXI9WS51YSkoYSxiLGMsZCk7XG5lLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXRDb3VudD0oYSxiLGMsZCk9PihlLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXRDb3VudD1ZLnZhKShhLGIsYyxkKTtlLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXROYW1lPShhLGIsYyxkKT0+KGUuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9WS53YSkoYSxiLGMsZCk7ZS5fT3J0VHJhaW5pbmdSZWxlYXNlU2Vzc2lvbj1hPT4oZS5fT3J0VHJhaW5pbmdSZWxlYXNlU2Vzc2lvbj1ZLnhhKShhKTt2YXIgSmE9KCk9PihKYT1ZLnlhKSgpLEJhPWUuX21hbGxvYz1hPT4oQmE9ZS5fbWFsbG9jPVkuemEpKGEpO2UuX2ZyZWU9YT0+KGUuX2ZyZWU9WS5BYSkoYSk7dmFyIEthPWE9PihLYT1ZLkNhKShhKSxOYT0oKT0+KE5hPVkuRGEpKCksT2E9YT0+KE9hPVkuRWEpKGEpLFBhPWE9PihQYT1ZLkZhKShhKTtcbmZ1bmN0aW9uIE1hKCl7dmFyIGE9WTthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5nPT5kKGcpPj4+MDthLnlhPWIoYS55YSk7YS56YT1jKGEuemEpO2EuRGE9YihhLkRhKTthLkZhPWMoYS5GYSk7cmV0dXJuIGF9ZS5zdGFja0FsbG9jPVBhO2Uuc3RhY2tTYXZlPU5hO2Uuc3RhY2tSZXN0b3JlPU9hO2UuVVRGOFRvU3RyaW5nPVI7ZS5zdHJpbmdUb1VURjg9KGEsYixjKT0+VChhLEgsYixjKTtlLmxlbmd0aEJ5dGVzVVRGOD1TO3ZhciBaO089ZnVuY3Rpb24gUWEoKXtafHxSYSgpO1p8fChPPVFhKX07XG5mdW5jdGlvbiBSYSgpe2lmKCEoMDxNKSl7aWYoZS5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGUucHJlUnVuJiYoZS5wcmVSdW49W2UucHJlUnVuXSk7ZS5wcmVSdW4ubGVuZ3RoOyl7dmFyIGE9ZS5wcmVSdW4uc2hpZnQoKTtLLnVuc2hpZnQoYSl9Zm9yKDswPEsubGVuZ3RoOylLLnNoaWZ0KCkoZSk7aWYoISgwPE18fFp8fChaPSEwLGUuY2FsbGVkUnVuPSEwLGZhKSkpe2Zvcig7MDxMLmxlbmd0aDspTC5zaGlmdCgpKGUpO2ZvcihrKGUpOzA8amEubGVuZ3RoOylqYS5zaGlmdCgpKGUpfX19UmEoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cbik7XG59KSgpO1xuO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc20pO1xuIiwgIiIsICIiLCAiZXhwb3J0IGNvbnN0IGNwdXMgPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc21UaHJlYWRlZCA9ICgoKSA9PiB7XG4gIHZhciBfc2NyaXB0RGlyID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5jdXJyZW50U2NyaXB0ID8gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMgOiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgX19maWxlbmFtZSAhPT0gJ3VuZGVmaW5lZCcpIF9zY3JpcHREaXIgPSBfc2NyaXB0RGlyIHx8IF9fZmlsZW5hbWU7XG4gIHJldHVybiAoXG5mdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkge1xuXG5mdW5jdGlvbiBnKCl7bS5idWZmZXIhPXAuYnVmZmVyJiZxKCk7cmV0dXJuIHB9ZnVuY3Rpb24gdCgpe20uYnVmZmVyIT1wLmJ1ZmZlciYmcSgpO3JldHVybiBhYX1mdW5jdGlvbiBiYSgpe20uYnVmZmVyIT1wLmJ1ZmZlciYmcSgpO3JldHVybiBjYX1mdW5jdGlvbiBkYSgpe20uYnVmZmVyIT1wLmJ1ZmZlciYmcSgpO3JldHVybiBlYX1mdW5jdGlvbiB2KCl7bS5idWZmZXIhPXAuYnVmZmVyJiZxKCk7cmV0dXJuIGZhfWZ1bmN0aW9uIHcoKXttLmJ1ZmZlciE9cC5idWZmZXImJnEoKTtyZXR1cm4gaGF9ZnVuY3Rpb24gaWEoKXttLmJ1ZmZlciE9cC5idWZmZXImJnEoKTtyZXR1cm4gamF9dmFyIHo9bW9kdWxlQXJnLGthLGxhO3oucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PntrYT1hO2xhPWJ9KTtcbnZhciBtYT1PYmplY3QuYXNzaWduKHt9LHopLG5hPVwiLi90aGlzLnByb2dyYW1cIixvYT0oYSxiKT0+e3Rocm93IGI7fSxwYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LEE9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxCPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSxEPXouRU5WSVJPTk1FTlRfSVNfUFRIUkVBRHx8ITEsRT1cIlwiO2Z1bmN0aW9uIHFhKGEpe3JldHVybiB6LmxvY2F0ZUZpbGU/ei5sb2NhdGVGaWxlKGEsRSk6RSthfXZhciByYSxzYSx0YTtcbmlmKEIpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksdWE9cmVxdWlyZShcInBhdGhcIik7RT1BP3VhLmRpcm5hbWUoRSkrXCIvXCI6X19kaXJuYW1lK1wiL1wiO3JhPShiLGMpPT57Yj12YShiKT9uZXcgVVJMKGIpOnVhLm5vcm1hbGl6ZShiKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGIsYz92b2lkIDA6XCJ1dGY4XCIpfTt0YT1iPT57Yj1yYShiLCEwKTtiLmJ1ZmZlcnx8KGI9bmV3IFVpbnQ4QXJyYXkoYikpO3JldHVybiBifTtzYT0oYixjLGQsZT0hMCk9PntiPXZhKGIpP25ldyBVUkwoYik6dWEubm9ybWFsaXplKGIpO2ZzLnJlYWRGaWxlKGIsZT92b2lkIDA6XCJ1dGY4XCIsKGYsayk9PntmP2QoZik6YyhlP2suYnVmZmVyOmspfSl9OyF6LnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihuYT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO29hPShiLGMpPT57cHJvY2Vzcy5leGl0Q29kZT1iO3Rocm93IGM7fTt6Lmluc3BlY3Q9KCk9PlxuXCJbRW1zY3JpcHRlbiBNb2R1bGUgb2JqZWN0XVwiO2xldCBhO3RyeXthPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKX1jYXRjaChiKXt0aHJvdyBjb25zb2xlLmVycm9yKCdUaGUgXCJ3b3JrZXJfdGhyZWFkc1wiIG1vZHVsZSBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgbm9kZS5qcyBidWlsZCAtIHBlcmhhcHMgYSBuZXdlciB2ZXJzaW9uIGlzIG5lZWRlZD8nKSxiO31nbG9iYWwuV29ya2VyPWEuV29ya2VyfWVsc2UgaWYocGF8fEEpQT9FPXNlbGYubG9jYXRpb24uaHJlZjpcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQmJihFPWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjKSwodHlwZW9mIF9zY3JpcHREaXIgIT09IFwidW5kZWZpbmVkXCIgJiYgX3NjcmlwdERpcikmJihFPV9zY3JpcHREaXIpLDAhPT1FLmluZGV4T2YoXCJibG9iOlwiKT9FPUUuc3Vic3RyKDAsRS5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTpFPVwiXCIsQnx8KHJhPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsXG5hLCExKTtiLnNlbmQobnVsbCk7cmV0dXJuIGIucmVzcG9uc2VUZXh0fSxBJiYodGE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLHNhPShhLGIsYyk9Pnt2YXIgZD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZC5vcGVuKFwiR0VUXCIsYSwhMCk7ZC5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Qub25sb2FkPSgpPT57MjAwPT1kLnN0YXR1c3x8MD09ZC5zdGF0dXMmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9O2Qub25lcnJvcj1jO2Quc2VuZChudWxsKX0pO0ImJlwidW5kZWZpbmVkXCI9PXR5cGVvZiBwZXJmb3JtYW5jZSYmKGdsb2JhbC5wZXJmb3JtYW5jZT1yZXF1aXJlKFwicGVyZl9ob29rc1wiKS5wZXJmb3JtYW5jZSk7dmFyIHdhPWNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkseGE9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO1xuQiYmKHdhPSguLi5hKT0+ZnMud3JpdGVTeW5jKDEsYS5qb2luKFwiIFwiKStcIlxcblwiKSx4YT0oLi4uYSk9PmZzLndyaXRlU3luYygyLGEuam9pbihcIiBcIikrXCJcXG5cIikpO3ZhciB5YT13YSxGPXhhO09iamVjdC5hc3NpZ24oeixtYSk7bWE9bnVsbDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJnphKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgbSxBYSxCYT0hMSxHLHAsYWEsY2EsZWEsZmEsaGEsQ2EsSCxEYSxqYTtcbmZ1bmN0aW9uIHEoKXt2YXIgYT1tLmJ1ZmZlcjt6LkhFQVA4PXA9bmV3IEludDhBcnJheShhKTt6LkhFQVAxNj1jYT1uZXcgSW50MTZBcnJheShhKTt6LkhFQVBVOD1hYT1uZXcgVWludDhBcnJheShhKTt6LkhFQVBVMTY9ZWE9bmV3IFVpbnQxNkFycmF5KGEpO3ouSEVBUDMyPWZhPW5ldyBJbnQzMkFycmF5KGEpO3ouSEVBUFUzMj1oYT1uZXcgVWludDMyQXJyYXkoYSk7ei5IRUFQRjMyPUNhPW5ldyBGbG9hdDMyQXJyYXkoYSk7ei5IRUFQRjY0PWphPW5ldyBGbG9hdDY0QXJyYXkoYSk7ei5IRUFQNjQ9SD1uZXcgQmlnSW50NjRBcnJheShhKTt6LkhFQVBVNjQ9RGE9bmV3IEJpZ1VpbnQ2NEFycmF5KGEpfXZhciBFYT0xNjc3NzIxNjtcbmlmKEQpbT16Lndhc21NZW1vcnk7ZWxzZSBpZih6Lndhc21NZW1vcnkpbT16Lndhc21NZW1vcnk7ZWxzZSBpZihtPW5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6RWEvNjU1MzYsbWF4aW11bTo2NTUzNixzaGFyZWQ6ITB9KSwhKG0uYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKXRocm93IEYoXCJyZXF1ZXN0ZWQgYSBzaGFyZWQgV2ViQXNzZW1ibHkuTWVtb3J5IGJ1dCB0aGUgcmV0dXJuZWQgYnVmZmVyIGlzIG5vdCBhIFNoYXJlZEFycmF5QnVmZmVyLCBpbmRpY2F0aW5nIHRoYXQgd2hpbGUgdGhlIGJyb3dzZXIgaGFzIFNoYXJlZEFycmF5QnVmZmVyIGl0IGRvZXMgbm90IGhhdmUgV2ViQXNzZW1ibHkgdGhyZWFkcyBzdXBwb3J0IC0geW91IG1heSBuZWVkIHRvIHNldCBhIGZsYWdcIiksQiYmRihcIihvbiBub2RlIHlvdSBtYXkgbmVlZDogLS1leHBlcmltZW50YWwtd2FzbS10aHJlYWRzIC0tZXhwZXJpbWVudGFsLXdhc20tYnVsay1tZW1vcnkgYW5kL29yIHJlY2VudCB2ZXJzaW9uKVwiKSxcbkVycm9yKFwiYmFkIG1lbW9yeVwiKTtxKCk7RWE9bS5idWZmZXIuYnl0ZUxlbmd0aDt2YXIgRmE9W10sR2E9W10sSGE9W10sST0wLElhPW51bGwsSj1udWxsO2Z1bmN0aW9uIEphKCl7SS0tO2lmKDA9PUkmJihudWxsIT09SWEmJihjbGVhckludGVydmFsKElhKSxJYT1udWxsKSxKKSl7dmFyIGE9SjtKPW51bGw7YSgpfX1mdW5jdGlvbiB6YShhKXthPVwiQWJvcnRlZChcIithK1wiKVwiO0YoYSk7QmE9ITA7Rz0xO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtsYShhKTt0aHJvdyBhO312YXIgS2E9YT0+YS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKSx2YT1hPT5hLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpLEs7Sz1cIm9ydC13YXNtLXRocmVhZGVkLndhc21cIjtLYShLKXx8KEs9cWEoSykpO1xuZnVuY3Rpb24gTGEoYSl7aWYodGEpcmV0dXJuIHRhKGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31mdW5jdGlvbiBNYShhKXtpZihwYXx8QSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiF2YShhKSlyZXR1cm4gZmV0Y2goYSx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihiPT57aWYoIWIub2spdGhyb3dcImZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJ1wiK2ErXCInXCI7cmV0dXJuIGIuYXJyYXlCdWZmZXIoKX0pLmNhdGNoKCgpPT5MYShhKSk7aWYoc2EpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57c2EoYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5MYShhKSl9XG5mdW5jdGlvbiBOYShhLGIsYyl7cmV0dXJuIE1hKGEpLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZCxiKSkudGhlbihkPT5kKS50aGVuKGMsZD0+e0YoYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7ZH1gKTt6YShkKX0pfWZ1bmN0aW9uIE9hKGEsYil7dmFyIGM9SztyZXR1cm5cImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8S2EoYyl8fHZhKGMpfHxCfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9OYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXtGKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApO0YoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gTmEoYyxhLGIpfSkpfVxudmFyIFBhPXs4OTE4Njg6KGEsYixjLGQpPT57aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIHp8fCF6LkhiKXJldHVybiAxO2E9TChhPj4+MCk7YS5zdGFydHNXaXRoKFwiLi9cIikmJihhPWEuc3Vic3RyaW5nKDIpKTthPXouSGIuZ2V0KGEpO2lmKCFhKXJldHVybiAyO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2lmKGIrYz5hLmJ5dGVMZW5ndGgpcmV0dXJuIDM7dHJ5e3JldHVybiB0KCkuc2V0KGEuc3ViYXJyYXkoYixiK2MpLGQ+Pj4wKSwwfWNhdGNoe3JldHVybiA0fX19O2Z1bmN0aW9uIFFhKGEpe3RoaXMubmFtZT1cIkV4aXRTdGF0dXNcIjt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHthfSlgO3RoaXMuc3RhdHVzPWF9XG52YXIgUmE9YT0+e2EudGVybWluYXRlKCk7YS5vbm1lc3NhZ2U9KCk9Pnt9fSxUYT1hPT57MD09TS5vYi5sZW5ndGgmJihTYSgpLE0uQmIoTS5vYlswXSkpO3ZhciBiPU0ub2IucG9wKCk7aWYoIWIpcmV0dXJuIDY7TS5wYi5wdXNoKGIpO00ua2JbYS5uYl09YjtiLm5iPWEubmI7dmFyIGM9e2NtZDpcInJ1blwiLHN0YXJ0X3JvdXRpbmU6YS5PYixhcmc6YS5JYixwdGhyZWFkX3B0cjphLm5ifTtCJiZiLnVucmVmKCk7Yi5wb3N0TWVzc2FnZShjLGEuVWIpO3JldHVybiAwfSxPPTAsVWE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLFZhPShhLGIsYyk9PntiPj4+PTA7dmFyIGQ9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1kKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJlVhKXJldHVybiBVYS5kZWNvZGUoYS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcj9hLnNsaWNlKGIsYyk6YS5zdWJhcnJheShiLGMpKTtcbmZvcihkPVwiXCI7YjxjOyl7dmFyIGU9YVtiKytdO2lmKGUmMTI4KXt2YXIgZj1hW2IrK10mNjM7aWYoMTkyPT0oZSYyMjQpKWQrPVN0cmluZy5mcm9tQ2hhckNvZGUoKGUmMzEpPDw2fGYpO2Vsc2V7dmFyIGs9YVtiKytdJjYzO2U9MjI0PT0oZSYyNDApPyhlJjE1KTw8MTJ8Zjw8NnxrOihlJjcpPDwxOHxmPDwxMnxrPDw2fGFbYisrXSY2Mzs2NTUzNj5lP2QrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSk6KGUtPTY1NTM2LGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8ZT4+MTAsNTYzMjB8ZSYxMDIzKSl9fWVsc2UgZCs9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gZH0sTD0oYSxiKT0+KGE+Pj49MCk/VmEodCgpLGEsYik6XCJcIixZYT1hPT57dmFyIGI9V2EoKTthPWEoKTtYYShiKTtyZXR1cm4gYX07XG5mdW5jdGlvbiBQKGEsYil7dmFyIGM9YXJndW1lbnRzLmxlbmd0aC0yLGQ9YXJndW1lbnRzO3JldHVybiBZYSgoKT0+e2Zvcih2YXIgZT0yKmMsZj1aYSg4KmUpLGs9Zj4+PjMsbD0wO2w8YztsKyspe3ZhciByPWRbMitsXTtcImJpZ2ludFwiPT10eXBlb2Ygcj8oSFtrKzIqbF09MW4sSFtrKzIqbCsxXT1yKTooSFtrKzIqbF09MG4saWEoKVtrKzIqbCsxPj4+MF09cil9cmV0dXJuICRhKGEsZSxmLGIpfSl9ZnVuY3Rpb24gYWIoYSl7aWYoRClyZXR1cm4gUCgwLDEsYSk7Rz1hOzA8T3x8KE0uUGIoKSx6Lm9uRXhpdD8uKGEpLEJhPSEwKTtvYShhLG5ldyBRYShhKSl9dmFyIGNiPWE9PntHPWE7aWYoRCl0aHJvdyBiYihhKSxcInVud2luZFwiO2FiKGEpfTtmdW5jdGlvbiBkYigpe2Zvcih2YXIgYT16Lm51bVRocmVhZHM7YS0tOylTYSgpO0ZhLnVuc2hpZnQoKCk9PntJKys7ZWIoKCk9PkphKCkpfSl9XG5mdW5jdGlvbiBTYSgpe3ZhciBhPXFhKFwib3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzXCIpO2E9bmV3IFdvcmtlcihhKTtNLm9iLnB1c2goYSl9ZnVuY3Rpb24gZWIoYSl7RD9hKCk6UHJvbWlzZS5hbGwoTS5vYi5tYXAoTS5CYikpLnRoZW4oYSl9XG52YXIgTT17b2I6W10scGI6W10sR2I6W10sa2I6e30sd2IoKXtEPyhNLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1NLk5iLE0udGhyZWFkSW5pdFRMUz1NLkZiLE0uc2V0RXhpdFN0YXR1cz1NLkViKTpkYigpfSxFYjphPT5HPWEsWGI6W1wiJHRlcm1pbmF0ZVdvcmtlclwiXSxQYjooKT0+e2Zvcih2YXIgYSBvZiBNLnBiKVJhKGEpO2ZvcihhIG9mIE0ub2IpUmEoYSk7TS5vYj1bXTtNLnBiPVtdO00ua2I9W119LERiOmE9Pnt2YXIgYj1hLm5iO2RlbGV0ZSBNLmtiW2JdO00ub2IucHVzaChhKTtNLnBiLnNwbGljZShNLnBiLmluZGV4T2YoYSksMSk7YS5uYj0wO2ZiKGIpfSxOYigpe30sRmIoKXtNLkdiLmZvckVhY2goYT0+YSgpKX0sQmI6YT0+bmV3IFByb21pc2UoYj0+e2Eub25tZXNzYWdlPWY9PntmPWYuZGF0YTt2YXIgaz1mLmNtZDtpZihmLnRhcmdldFRocmVhZCYmZi50YXJnZXRUaHJlYWQhPWdiKCkpe3ZhciBsPU0ua2JbZi50YXJnZXRUaHJlYWRdO2w/bC5wb3N0TWVzc2FnZShmLGYudHJhbnNmZXJMaXN0KTpcbkYoYEludGVybmFsIGVycm9yISBXb3JrZXIgc2VudCBhIG1lc3NhZ2UgXCIke2t9XCIgdG8gdGFyZ2V0IHB0aHJlYWQgJHtmLnRhcmdldFRocmVhZH0sIGJ1dCB0aGF0IHRocmVhZCBubyBsb25nZXIgZXhpc3RzIWApfWVsc2UgaWYoXCJjaGVja01haWxib3hcIj09PWspaGIoKTtlbHNlIGlmKFwic3Bhd25UaHJlYWRcIj09PWspVGEoZik7ZWxzZSBpZihcImNsZWFudXBUaHJlYWRcIj09PWspTS5EYihNLmtiW2YudGhyZWFkXSk7ZWxzZSBpZihcImtpbGxUaHJlYWRcIj09PWspZj1mLnRocmVhZCxrPU0ua2JbZl0sZGVsZXRlIE0ua2JbZl0sUmEoayksZmIoZiksTS5wYi5zcGxpY2UoTS5wYi5pbmRleE9mKGspLDEpLGsubmI9MDtlbHNlIGlmKFwiY2FuY2VsVGhyZWFkXCI9PT1rKU0ua2JbZi50aHJlYWRdLnBvc3RNZXNzYWdlKHtjbWQ6XCJjYW5jZWxcIn0pO2Vsc2UgaWYoXCJsb2FkZWRcIj09PWspYS5sb2FkZWQ9ITAsQiYmIWEubmImJmEudW5yZWYoKSxiKGEpO2Vsc2UgaWYoXCJhbGVydFwiPT09aylhbGVydChgVGhyZWFkICR7Zi50aHJlYWRJZH06ICR7Zi50ZXh0fWApO1xuZWxzZSBpZihcInNldGltbWVkaWF0ZVwiPT09Zi50YXJnZXQpYS5wb3N0TWVzc2FnZShmKTtlbHNlIGlmKFwiY2FsbEhhbmRsZXJcIj09PWspeltmLmhhbmRsZXJdKC4uLmYuYXJncyk7ZWxzZSBrJiZGKGB3b3JrZXIgc2VudCBhbiB1bmtub3duIGNvbW1hbmQgJHtrfWApfTthLm9uZXJyb3I9Zj0+e0YoYCR7XCJ3b3JrZXIgc2VudCBhbiBlcnJvciFcIn0gJHtmLmZpbGVuYW1lfToke2YubGluZW5vfTogJHtmLm1lc3NhZ2V9YCk7dGhyb3cgZjt9O0ImJihhLm9uKFwibWVzc2FnZVwiLGY9PmEub25tZXNzYWdlKHtkYXRhOmZ9KSksYS5vbihcImVycm9yXCIsZj0+YS5vbmVycm9yKGYpKSk7dmFyIGM9W10sZD1bXCJvbkV4aXRcIl0sZTtmb3IoZSBvZiBkKXouaGFzT3duUHJvcGVydHkoZSkmJmMucHVzaChlKTthLnBvc3RNZXNzYWdlKHtjbWQ6XCJsb2FkXCIsaGFuZGxlcnM6Yyx1cmxPckJsb2I6ei5tYWluU2NyaXB0VXJsT3JCbG9ifHxfc2NyaXB0RGlyLHdhc21NZW1vcnk6bSx3YXNtTW9kdWxlOkFhfSl9KX07XG56LlBUaHJlYWQ9TTt2YXIgaWI9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKHopfTt6LmVzdGFibGlzaFN0YWNrU3BhY2U9KCk9Pnt2YXIgYT1nYigpLGI9dygpW2ErNTI+Pj4yPj4+MF07YT13KClbYSs1Nj4+PjI+Pj4wXTtqYihiLGItYSk7WGEoYil9O2Z1bmN0aW9uIGJiKGEpe2lmKEQpcmV0dXJuIFAoMSwwLGEpO2NiKGEpfXZhciBrYj1bXSxsYjt6Lmludm9rZUVudHJ5UG9pbnQ9KGEsYik9Pnt2YXIgYz1rYlthXTtjfHwoYT49a2IubGVuZ3RoJiYoa2IubGVuZ3RoPWErMSksa2JbYV09Yz1sYi5nZXQoYSkpO2E9YyhiKTswPE8/TS5FYihhKTptYihhKX07XG5mdW5jdGlvbiBuYihhKXt0aGlzLnRiPWEtMjQ7dGhpcy5NYj1mdW5jdGlvbihiKXt3KClbdGhpcy50Yis0Pj4+Mj4+PjBdPWJ9O3RoaXMueWI9ZnVuY3Rpb24oYil7dygpW3RoaXMudGIrOD4+PjI+Pj4wXT1ifTt0aGlzLndiPWZ1bmN0aW9uKGIsYyl7dGhpcy54YigpO3RoaXMuTWIoYik7dGhpcy55YihjKX07dGhpcy54Yj1mdW5jdGlvbigpe3coKVt0aGlzLnRiKzE2Pj4+Mj4+PjBdPTB9fXZhciBvYj0wLHBiPTA7ZnVuY3Rpb24gcWIoYSxiLGMsZCl7cmV0dXJuIEQ/UCgyLDEsYSxiLGMsZCk6cmIoYSxiLGMsZCl9XG5mdW5jdGlvbiByYihhLGIsYyxkKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyKXJldHVybiBGKFwiQ3VycmVudCBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IFNoYXJlZEFycmF5QnVmZmVyLCBwdGhyZWFkcyBhcmUgbm90IGF2YWlsYWJsZSFcIiksNjt2YXIgZT1bXTtpZihEJiYwPT09ZS5sZW5ndGgpcmV0dXJuIHFiKGEsYixjLGQpO2E9e09iOmMsbmI6YSxJYjpkLFViOmV9O3JldHVybiBEPyhhLldiPVwic3Bhd25UaHJlYWRcIixwb3N0TWVzc2FnZShhLGUpLDApOlRhKGEpfWZ1bmN0aW9uIHNiKGEsYixjKXtyZXR1cm4gRD9QKDMsMSxhLGIsYyk6MH1mdW5jdGlvbiB0YihhLGIpe2lmKEQpcmV0dXJuIFAoNCwxLGEsYil9XG52YXIgdWI9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGQ9YS5jaGFyQ29kZUF0KGMpOzEyNz49ZD9iKys6MjA0Nz49ZD9iKz0yOjU1Mjk2PD1kJiY1NzM0Mz49ZD8oYis9NCwrK2MpOmIrPTN9cmV0dXJuIGJ9LHZiPShhLGIsYyxkKT0+e2M+Pj49MDtpZighKDA8ZCkpcmV0dXJuIDA7dmFyIGU9YztkPWMrZC0xO2Zvcih2YXIgZj0wO2Y8YS5sZW5ndGg7KytmKXt2YXIgaz1hLmNoYXJDb2RlQXQoZik7aWYoNTUyOTY8PWsmJjU3MzQzPj1rKXt2YXIgbD1hLmNoYXJDb2RlQXQoKytmKTtrPTY1NTM2KygoayYxMDIzKTw8MTApfGwmMTAyM31pZigxMjc+PWspe2lmKGM+PWQpYnJlYWs7YltjKys+Pj4wXT1rfWVsc2V7aWYoMjA0Nz49ayl7aWYoYysxPj1kKWJyZWFrO2JbYysrPj4+MF09MTkyfGs+PjZ9ZWxzZXtpZig2NTUzNT49ayl7aWYoYysyPj1kKWJyZWFrO2JbYysrPj4+MF09MjI0fGs+PjEyfWVsc2V7aWYoYyszPj1kKWJyZWFrO2JbYysrPj4+MF09MjQwfGs+PlxuMTg7YltjKys+Pj4wXT0xMjh8az4+MTImNjN9YltjKys+Pj4wXT0xMjh8az4+NiY2M31iW2MrKz4+PjBdPTEyOHxrJjYzfX1iW2M+Pj4wXT0wO3JldHVybiBjLWV9LHdiPShhLGIsYyk9PnZiKGEsdCgpLGIsYyk7ZnVuY3Rpb24geGIoYSxiKXtpZihEKXJldHVybiBQKDUsMSxhLGIpfWZ1bmN0aW9uIHliKGEsYixjKXtpZihEKXJldHVybiBQKDYsMSxhLGIsYyl9ZnVuY3Rpb24gemIoYSxiLGMpe3JldHVybiBEP1AoNywxLGEsYixjKTowfWZ1bmN0aW9uIEFiKGEsYil7aWYoRClyZXR1cm4gUCg4LDEsYSxiKX1mdW5jdGlvbiBCYihhLGIsYyl7aWYoRClyZXR1cm4gUCg5LDEsYSxiLGMpfWZ1bmN0aW9uIENiKGEsYixjLGQpe2lmKEQpcmV0dXJuIFAoMTAsMSxhLGIsYyxkKX1mdW5jdGlvbiBEYihhLGIsYyxkKXtpZihEKXJldHVybiBQKDExLDEsYSxiLGMsZCl9ZnVuY3Rpb24gRWIoYSxiLGMsZCl7aWYoRClyZXR1cm4gUCgxMiwxLGEsYixjLGQpfVxuZnVuY3Rpb24gRmIoYSl7aWYoRClyZXR1cm4gUCgxMywxLGEpfWZ1bmN0aW9uIEdiKGEsYil7aWYoRClyZXR1cm4gUCgxNCwxLGEsYil9ZnVuY3Rpb24gSGIoYSxiLGMpe2lmKEQpcmV0dXJuIFAoMTUsMSxhLGIsYyl9dmFyIEliPWE9PntpZihudWxsPT09YSlyZXR1cm5cIm51bGxcIjt2YXIgYj10eXBlb2YgYTtyZXR1cm5cIm9iamVjdFwiPT09Ynx8XCJhcnJheVwiPT09Ynx8XCJmdW5jdGlvblwiPT09Yj9hLnRvU3RyaW5nKCk6XCJcIithfSxKYixSPWE9Pntmb3IodmFyIGI9XCJcIjt0KClbYT4+PjBdOyliKz1KYlt0KClbYSsrPj4+MF1dO3JldHVybiBifSxLYj17fSxMYj17fSxNYj17fSxTO1xuZnVuY3Rpb24gTmIoYSxiLGM9e30pe3ZhciBkPWIubmFtZTtpZighYSl0aHJvdyBuZXcgUyhgdHlwZSBcIiR7ZH1cIiBtdXN0IGhhdmUgYSBwb3NpdGl2ZSBpbnRlZ2VyIHR5cGVpZCBwb2ludGVyYCk7aWYoTGIuaGFzT3duUHJvcGVydHkoYSkpe2lmKGMuS2IpcmV0dXJuO3Rocm93IG5ldyBTKGBDYW5ub3QgcmVnaXN0ZXIgdHlwZSAnJHtkfScgdHdpY2VgKTt9TGJbYV09YjtkZWxldGUgTWJbYV07S2IuaGFzT3duUHJvcGVydHkoYSkmJihiPUtiW2FdLGRlbGV0ZSBLYlthXSxiLmZvckVhY2goZT0+ZSgpKSl9ZnVuY3Rpb24gVChhLGIsYz17fSl7aWYoIShcImFyZ1BhY2tBZHZhbmNlXCJpbiBiKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZVwiKTtOYihhLGIsYyl9XG52YXIgT2I9KGEsYixjKT0+e3N3aXRjaChiKXtjYXNlIDE6cmV0dXJuIGM/ZD0+ZygpW2Q+Pj4wPj4+MF06ZD0+dCgpW2Q+Pj4wPj4+MF07Y2FzZSAyOnJldHVybiBjP2Q9PmJhKClbZD4+PjE+Pj4wXTpkPT5kYSgpW2Q+Pj4xPj4+MF07Y2FzZSA0OnJldHVybiBjP2Q9PnYoKVtkPj4+Mj4+PjBdOmQ9PncoKVtkPj4+Mj4+PjBdO2Nhc2UgODpyZXR1cm4gYz9kPT5IW2Q+Pj4zXTpkPT5EYVtkPj4+M107ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7Yn0pOiAke2F9YCk7fX07ZnVuY3Rpb24gUGIoKXt0aGlzLm1iPVt2b2lkIDBdO3RoaXMuQWI9W119dmFyIFU9bmV3IFBiO2Z1bmN0aW9uIFFiKGEpe2E+Pj49MDthPj1VLnRiJiYwPT09LS1VLmdldChhKS5DYiYmVS55YihhKX1cbnZhciBWPWE9PntpZighYSl0aHJvdyBuZXcgUyhcIkNhbm5vdCB1c2UgZGVsZXRlZCB2YWwuIGhhbmRsZSA9IFwiK2EpO3JldHVybiBVLmdldChhKS52YWx1ZX0sVz1hPT57c3dpdGNoKGEpe2Nhc2Ugdm9pZCAwOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlICEwOnJldHVybiAzO2Nhc2UgITE6cmV0dXJuIDQ7ZGVmYXVsdDpyZXR1cm4gVS54Yih7Q2I6MSx2YWx1ZTphfSl9fTtmdW5jdGlvbiBSYihhKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUodigpW2E+Pj4yPj4+MF0pfVxudmFyIFNiPShhLGIpPT57c3dpdGNoKGIpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyl7dmFyIGQ9dGhpcy5mcm9tV2lyZVR5cGU7bS5idWZmZXIhPXAuYnVmZmVyJiZxKCk7cmV0dXJuIGQuY2FsbCh0aGlzLENhW2M+Pj4yPj4+MF0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShpYSgpW2M+Pj4zPj4+MF0pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7Yn0pOiAke2F9YCk7fX07ZnVuY3Rpb24gVGIoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHcoKVthPj4+Mj4+PjBdKX1cbnZhciBVYj1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmLTE2bGVcIik6dm9pZCAwLFZiPShhLGIpPT57dmFyIGM9YT4+MTtmb3IodmFyIGQ9YytiLzI7IShjPj1kKSYmZGEoKVtjPj4+MF07KSsrYztjPDw9MTtpZigzMjxjLWEmJlViKXJldHVybiBVYi5kZWNvZGUodCgpLnNsaWNlKGEsYykpO2M9XCJcIjtmb3IoZD0wOyEoZD49Yi8yKTsrK2Qpe3ZhciBlPWJhKClbYSsyKmQ+Pj4xPj4+MF07aWYoMD09ZSlicmVhaztjKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBjfSxXYj0oYSxiLGMpPT57Yz8/PTIxNDc0ODM2NDc7aWYoMj5jKXJldHVybiAwO2MtPTI7dmFyIGQ9YjtjPWM8MiphLmxlbmd0aD9jLzI6YS5sZW5ndGg7Zm9yKHZhciBlPTA7ZTxjOysrZSl7dmFyIGY9YS5jaGFyQ29kZUF0KGUpO2JhKClbYj4+PjE+Pj4wXT1mO2IrPTJ9YmEoKVtiPj4+MT4+PjBdPTA7cmV0dXJuIGItZH0sWGI9YT0+MiphLmxlbmd0aCxZYj0oYSxiKT0+XG57Zm9yKHZhciBjPTAsZD1cIlwiOyEoYz49Yi80KTspe3ZhciBlPXYoKVthKzQqYz4+PjI+Pj4wXTtpZigwPT1lKWJyZWFrOysrYzs2NTUzNjw9ZT8oZS09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxlPj4xMCw1NjMyMHxlJjEwMjMpKTpkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBkfSxaYj0oYSxiLGMpPT57Yj4+Pj0wO2M/Pz0yMTQ3NDgzNjQ3O2lmKDQ+YylyZXR1cm4gMDt2YXIgZD1iO2M9ZCtjLTQ7Zm9yKHZhciBlPTA7ZTxhLmxlbmd0aDsrK2Upe3ZhciBmPWEuY2hhckNvZGVBdChlKTtpZig1NTI5Njw9ZiYmNTczNDM+PWYpe3ZhciBrPWEuY2hhckNvZGVBdCgrK2UpO2Y9NjU1MzYrKChmJjEwMjMpPDwxMCl8ayYxMDIzfXYoKVtiPj4+Mj4+PjBdPWY7Yis9NDtpZihiKzQ+YylicmVha312KClbYj4+PjI+Pj4wXT0wO3JldHVybiBiLWR9LCRiPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTs1NTI5Njw9XG5kJiY1NzM0Mz49ZCYmKytjO2IrPTR9cmV0dXJuIGJ9O2Z1bmN0aW9uIGFjKGEpe2E+Pj49MDtcImZ1bmN0aW9uXCI9PT10eXBlb2YgQXRvbWljcy5WYiYmKEF0b21pY3MuVmIodigpLGE+Pj4yLGEpLnZhbHVlLnRoZW4oaGIpLGErPTEyOCxBdG9taWNzLnN0b3JlKHYoKSxhPj4+MiwxKSl9ei5fX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9YWM7dmFyIGhiPSgpPT57dmFyIGE9Z2IoKTtpZihhJiYoYWMoYSksYT1iYywhQmEpKXRyeXtpZihhKCksISgwPE8pKXRyeXtEP21iKEcpOmNiKEcpfWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBRYXx8XCJ1bndpbmRcIj09Ynx8b2EoMSxiKX19Y2F0Y2goYil7YiBpbnN0YW5jZW9mIFFhfHxcInVud2luZFwiPT1ifHxvYSgxLGIpfX07ei5jaGVja01haWxib3g9aGI7XG52YXIgY2M9W10sZWM9KGEsYik9Pnt2YXIgYz1MYlthXTtpZih2b2lkIDA9PT1jKXRocm93IGE9ZGMoYSksYz1SKGEpLFgoYSksbmV3IFMoYitcIiBoYXMgdW5rbm93biB0eXBlIFwiK2MpO3JldHVybiBjfSxmYz0oYSxiLGMpPT57dmFyIGQ9W107YT1hLnRvV2lyZVR5cGUoZCxjKTtkLmxlbmd0aCYmKHcoKVtiPj4+Mj4+PjBdPVcoZCkpO3JldHVybiBhfSxnYz1bXSxoYz17fSxpYz1hPT57dmFyIGI9aGNbYV07cmV0dXJuIHZvaWQgMD09PWI/UihhKTpifSxqYz0oKT0+XCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczpGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksa2M9YT0+e3ZhciBiPWdjLmxlbmd0aDtnYy5wdXNoKGEpO3JldHVybiBifSxsYz0oYSxiKT0+e2Zvcih2YXIgYz1BcnJheShhKSxkPTA7ZDxhOysrZCljW2RdPWVjKHcoKVtiKzQqZD4+PjI+Pj4wXSxcInBhcmFtZXRlciBcIitkKTtyZXR1cm4gY30sbmM9KGEsYik9Pk9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLFxuXCJuYW1lXCIse3ZhbHVlOmF9KTtmdW5jdGlvbiBvYyhhKXt2YXIgYj1GdW5jdGlvbjtpZighKGIgaW5zdGFuY2VvZiBGdW5jdGlvbikpdGhyb3cgbmV3IFR5cGVFcnJvcihgbmV3XyBjYWxsZWQgd2l0aCBjb25zdHJ1Y3RvciB0eXBlICR7dHlwZW9mIGJ9IHdoaWNoIGlzIG5vdCBhIGZ1bmN0aW9uYCk7dmFyIGM9bmMoYi5uYW1lfHxcInVua25vd25GdW5jdGlvbk5hbWVcIixmdW5jdGlvbigpe30pO2MucHJvdG90eXBlPWIucHJvdG90eXBlO2M9bmV3IGM7YT1iLmFwcGx5KGMsYSk7cmV0dXJuIGEgaW5zdGFuY2VvZiBPYmplY3Q/YTpjfXZhciBZPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCkscGM9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0scWM9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF07ZnVuY3Rpb24gcmMoYSxiLGMsZCxlLGYsayl7cmV0dXJuIEQ/UCgxNiwxLGEsYixjLGQsZSxmLGspOi01Mn1cbmZ1bmN0aW9uIHNjKGEsYixjLGQsZSxmKXtpZihEKXJldHVybiBQKDE3LDEsYSxiLGMsZCxlLGYpfXZhciB1Yz1hPT57dmFyIGI9dWIoYSkrMSxjPXRjKGIpO2MmJndiKGEsYyxiKTtyZXR1cm4gY30sdmM9W10sd2M9e30seWM9KCk9PntpZigheGMpe3ZhciBhPXtVU0VSOlwid2ViX3VzZXJcIixMT0dOQU1FOlwid2ViX3VzZXJcIixQQVRIOlwiL1wiLFBXRDpcIi9cIixIT01FOlwiL2hvbWUvd2ViX3VzZXJcIixMQU5HOihcIm9iamVjdFwiPT10eXBlb2YgbmF2aWdhdG9yJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHxcIkNcIikucmVwbGFjZShcIi1cIixcIl9cIikrXCIuVVRGLThcIixfOm5hfHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gd2Mpdm9pZCAwPT09d2NbYl0/ZGVsZXRlIGFbYl06YVtiXT13Y1tiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7eGM9Y31yZXR1cm4geGN9LHhjO1xuZnVuY3Rpb24gemMoYSxiKXtpZihEKXJldHVybiBQKDE4LDEsYSxiKTthPj4+PTA7Yj4+Pj0wO3ZhciBjPTA7eWMoKS5mb3JFYWNoKChkLGUpPT57dmFyIGY9YitjO2U9dygpW2ErNCplPj4+Mj4+PjBdPWY7Zm9yKGY9MDtmPGQubGVuZ3RoOysrZilnKClbZSsrPj4+MD4+PjBdPWQuY2hhckNvZGVBdChmKTtnKClbZT4+PjA+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH1mdW5jdGlvbiBBYyhhLGIpe2lmKEQpcmV0dXJuIFAoMTksMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9eWMoKTt3KClbYT4+PjI+Pj4wXT1jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChlPT5kKz1lLmxlbmd0aCsxKTt3KClbYj4+PjI+Pj4wXT1kO3JldHVybiAwfWZ1bmN0aW9uIEJjKGEpe3JldHVybiBEP1AoMjAsMSxhKTo1Mn1mdW5jdGlvbiBDYyhhLGIsYyxkKXtyZXR1cm4gRD9QKDIxLDEsYSxiLGMsZCk6NTJ9XG5mdW5jdGlvbiBEYyhhLGIsYyxkKXtyZXR1cm4gRD9QKDIyLDEsYSxiLGMsZCk6NzB9dmFyIEVjPVtudWxsLFtdLFtdXTtmdW5jdGlvbiBGYyhhLGIsYyxkKXtpZihEKXJldHVybiBQKDIzLDEsYSxiLGMsZCk7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7Zm9yKHZhciBlPTAsZj0wO2Y8YztmKyspe3ZhciBrPXcoKVtiPj4+Mj4+PjBdLGw9dygpW2IrND4+PjI+Pj4wXTtiKz04O2Zvcih2YXIgcj0wO3I8bDtyKyspe3ZhciBuPXQoKVtrK3I+Pj4wXSx4PUVjW2FdOzA9PT1ufHwxMD09PW4/KCgxPT09YT95YTpGKShWYSh4LDApKSx4Lmxlbmd0aD0wKTp4LnB1c2gobil9ZSs9bH13KClbZD4+PjI+Pj4wXT1lO3JldHVybiAwfXZhciBHYz1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEhjPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gSWMoYSl7dmFyIGI9QXJyYXkodWIoYSkrMSk7dmIoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifVxudmFyIEpjPShhLGIpPT57ZygpLnNldChhLGI+Pj4wKX07XG5mdW5jdGlvbiBLYyhhLGIsYyxkKXtmdW5jdGlvbiBlKGgsdSx5KXtmb3IoaD1cIm51bWJlclwiPT10eXBlb2YgaD9oLnRvU3RyaW5nKCk6aHx8XCJcIjtoLmxlbmd0aDx1OyloPXlbMF0raDtyZXR1cm4gaH1mdW5jdGlvbiBmKGgsdSl7cmV0dXJuIGUoaCx1LFwiMFwiKX1mdW5jdGlvbiBrKGgsdSl7ZnVuY3Rpb24geShtYyl7cmV0dXJuIDA+bWM/LTE6MDxtYz8xOjB9dmFyIFE7MD09PShRPXkoaC5nZXRGdWxsWWVhcigpLXUuZ2V0RnVsbFllYXIoKSkpJiYwPT09KFE9eShoLmdldE1vbnRoKCktdS5nZXRNb250aCgpKSkmJihRPXkoaC5nZXREYXRlKCktdS5nZXREYXRlKCkpKTtyZXR1cm4gUX1mdW5jdGlvbiBsKGgpe3N3aXRjaChoLmdldERheSgpKXtjYXNlIDA6cmV0dXJuIG5ldyBEYXRlKGguZ2V0RnVsbFllYXIoKS0xLDExLDI5KTtjYXNlIDE6cmV0dXJuIGg7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShoLmdldEZ1bGxZZWFyKCksMCwzKTtjYXNlIDM6cmV0dXJuIG5ldyBEYXRlKGguZ2V0RnVsbFllYXIoKSxcbjAsMik7Y2FzZSA0OnJldHVybiBuZXcgRGF0ZShoLmdldEZ1bGxZZWFyKCksMCwxKTtjYXNlIDU6cmV0dXJuIG5ldyBEYXRlKGguZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGguZ2V0RnVsbFllYXIoKS0xLDExLDMwKX19ZnVuY3Rpb24gcihoKXt2YXIgdT1oLnFiO2ZvcihoPW5ldyBEYXRlKChuZXcgRGF0ZShoLnJiKzE5MDAsMCwxKSkuZ2V0VGltZSgpKTswPHU7KXt2YXIgeT1oLmdldE1vbnRoKCksUT0oWShoLmdldEZ1bGxZZWFyKCkpP0djOkhjKVt5XTtpZih1PlEtaC5nZXREYXRlKCkpdS09US1oLmdldERhdGUoKSsxLGguc2V0RGF0ZSgxKSwxMT55P2guc2V0TW9udGgoeSsxKTooaC5zZXRNb250aCgwKSxoLnNldEZ1bGxZZWFyKGguZ2V0RnVsbFllYXIoKSsxKSk7ZWxzZXtoLnNldERhdGUoaC5nZXREYXRlKCkrdSk7YnJlYWt9fXk9bmV3IERhdGUoaC5nZXRGdWxsWWVhcigpKzEsMCw0KTt1PWwobmV3IERhdGUoaC5nZXRGdWxsWWVhcigpLFxuMCw0KSk7eT1sKHkpO3JldHVybiAwPj1rKHUsaCk/MD49ayh5LGgpP2guZ2V0RnVsbFllYXIoKSsxOmguZ2V0RnVsbFllYXIoKTpoLmdldEZ1bGxZZWFyKCktMX1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7dmFyIG49dygpW2QrNDA+Pj4yPj4+MF07ZD17U2I6digpW2Q+Pj4yPj4+MF0sUmI6digpW2QrND4+PjI+Pj4wXSx1Yjp2KClbZCs4Pj4+Mj4+PjBdLHpiOnYoKVtkKzEyPj4+Mj4+PjBdLHZiOnYoKVtkKzE2Pj4+Mj4+PjBdLHJiOnYoKVtkKzIwPj4+Mj4+PjBdLGxiOnYoKVtkKzI0Pj4+Mj4+PjBdLHFiOnYoKVtkKzI4Pj4+Mj4+PjBdLFliOnYoKVtkKzMyPj4+Mj4+PjBdLFFiOnYoKVtkKzM2Pj4+Mj4+PjBdLFRiOm4/TChuKTpcIlwifTtjPUwoYyk7bj17XCIlY1wiOlwiJWEgJWIgJWQgJUg6JU06JVMgJVlcIixcIiVEXCI6XCIlbS8lZC8leVwiLFwiJUZcIjpcIiVZLSVtLSVkXCIsXCIlaFwiOlwiJWJcIixcIiVyXCI6XCIlSTolTTolUyAlcFwiLFwiJVJcIjpcIiVIOiVNXCIsXCIlVFwiOlwiJUg6JU06JVNcIixcIiV4XCI6XCIlbS8lZC8leVwiLFxuXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcIiVFQ1wiOlwiJUNcIixcIiVFeFwiOlwiJW0vJWQvJXlcIixcIiVFWFwiOlwiJUg6JU06JVNcIixcIiVFeVwiOlwiJXlcIixcIiVFWVwiOlwiJVlcIixcIiVPZFwiOlwiJWRcIixcIiVPZVwiOlwiJWVcIixcIiVPSFwiOlwiJUhcIixcIiVPSVwiOlwiJUlcIixcIiVPbVwiOlwiJW1cIixcIiVPTVwiOlwiJU1cIixcIiVPU1wiOlwiJVNcIixcIiVPdVwiOlwiJXVcIixcIiVPVVwiOlwiJVVcIixcIiVPVlwiOlwiJVZcIixcIiVPd1wiOlwiJXdcIixcIiVPV1wiOlwiJVdcIixcIiVPeVwiOlwiJXlcIn07Zm9yKHZhciB4IGluIG4pYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh4LFwiZ1wiKSxuW3hdKTt2YXIgQz1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLE49XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO249e1wiJWFcIjpoPT5DW2gubGJdLnN1YnN0cmluZygwLDMpLFwiJUFcIjpoPT5cbkNbaC5sYl0sXCIlYlwiOmg9Pk5baC52Yl0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmg9Pk5baC52Yl0sXCIlQ1wiOmg9PmYoKGgucmIrMTkwMCkvMTAwfDAsMiksXCIlZFwiOmg9PmYoaC56YiwyKSxcIiVlXCI6aD0+ZShoLnpiLDIsXCIgXCIpLFwiJWdcIjpoPT5yKGgpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJUdcIjpoPT5yKGgpLFwiJUhcIjpoPT5mKGgudWIsMiksXCIlSVwiOmg9PntoPWgudWI7MD09aD9oPTEyOjEyPGgmJihoLT0xMik7cmV0dXJuIGYoaCwyKX0sXCIlalwiOmg9Pntmb3IodmFyIHU9MCx5PTA7eTw9aC52Yi0xO3UrPShZKGgucmIrMTkwMCk/R2M6SGMpW3krK10pO3JldHVybiBmKGguemIrdSwzKX0sXCIlbVwiOmg9PmYoaC52YisxLDIpLFwiJU1cIjpoPT5mKGguUmIsMiksXCIlblwiOigpPT5cIlxcblwiLFwiJXBcIjpoPT4wPD1oLnViJiYxMj5oLnViP1wiQU1cIjpcIlBNXCIsXCIlU1wiOmg9PmYoaC5TYiwyKSxcIiV0XCI6KCk9PlwiXFx0XCIsXCIldVwiOmg9PmgubGJ8fDcsXCIlVVwiOmg9PmYoTWF0aC5mbG9vcigoaC5xYis3LWgubGIpL1xuNyksMiksXCIlVlwiOmg9Pnt2YXIgdT1NYXRoLmZsb29yKChoLnFiKzctKGgubGIrNiklNykvNyk7Mj49KGgubGIrMzcxLWgucWItMiklNyYmdSsrO2lmKHUpNTM9PXUmJih5PShoLmxiKzM3MS1oLnFiKSU3LDQ9PXl8fDM9PXkmJlkoaC5yYil8fCh1PTEpKTtlbHNle3U9NTI7dmFyIHk9KGgubGIrNy1oLnFiLTEpJTc7KDQ9PXl8fDU9PXkmJlkoaC5yYiU0MDAtMSkpJiZ1Kyt9cmV0dXJuIGYodSwyKX0sXCIld1wiOmg9PmgubGIsXCIlV1wiOmg9PmYoTWF0aC5mbG9vcigoaC5xYis3LShoLmxiKzYpJTcpLzcpLDIpLFwiJXlcIjpoPT4oaC5yYisxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVZXCI6aD0+aC5yYisxOTAwLFwiJXpcIjpoPT57aD1oLlFiO3ZhciB1PTA8PWg7aD1NYXRoLmFicyhoKS82MDtyZXR1cm4odT9cIitcIjpcIi1cIikrU3RyaW5nKFwiMDAwMFwiKyhoLzYwKjEwMCtoJTYwKSkuc2xpY2UoLTQpfSxcIiVaXCI6aD0+aC5UYixcIiUlXCI6KCk9PlwiJVwifTtjPWMucmVwbGFjZSgvJSUvZyxcIlxceDAwXFx4MDBcIik7XG5mb3IoeCBpbiBuKWMuaW5jbHVkZXMoeCkmJihjPWMucmVwbGFjZShuZXcgUmVnRXhwKHgsXCJnXCIpLG5beF0oZCkpKTtjPWMucmVwbGFjZSgvXFwwXFwwL2csXCIlXCIpO3g9SWMoYyk7aWYoeC5sZW5ndGg+YilyZXR1cm4gMDtKYyh4LGEpO3JldHVybiB4Lmxlbmd0aC0xfU0ud2IoKTtmb3IodmFyIExjPUFycmF5KDI1NiksTWM9MDsyNTY+TWM7KytNYylMY1tNY109U3RyaW5nLmZyb21DaGFyQ29kZShNYyk7SmI9TGM7Uz16LkJpbmRpbmdFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkJpbmRpbmdFcnJvclwifX07ei5JbnRlcm5hbEVycm9yPWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IoYSl7c3VwZXIoYSk7dGhpcy5uYW1lPVwiSW50ZXJuYWxFcnJvclwifX07XG5PYmplY3QuYXNzaWduKFBiLnByb3RvdHlwZSx7Z2V0KGEpe3JldHVybiB0aGlzLm1iW2FdfSxoYXMoYSl7cmV0dXJuIHZvaWQgMCE9PXRoaXMubWJbYV19LHhiKGEpe3ZhciBiPXRoaXMuQWIucG9wKCl8fHRoaXMubWIubGVuZ3RoO3RoaXMubWJbYl09YTtyZXR1cm4gYn0seWIoYSl7dGhpcy5tYlthXT12b2lkIDA7dGhpcy5BYi5wdXNoKGEpfX0pO1UubWIucHVzaCh7dmFsdWU6dm9pZCAwfSx7dmFsdWU6bnVsbH0se3ZhbHVlOiEwfSx7dmFsdWU6ITF9KTtVLnRiPVUubWIubGVuZ3RoO3ouY291bnRfZW12YWxfaGFuZGxlcz0oKT0+e2Zvcih2YXIgYT0wLGI9VS50YjtiPFUubWIubGVuZ3RoOysrYil2b2lkIDAhPT1VLm1iW2JdJiYrK2E7cmV0dXJuIGF9O1xudmFyIE5jPVthYixiYixxYixzYix0Yix4Yix5Yix6YixBYixCYixDYixEYixFYixGYixHYixIYixyYyxzYyx6YyxBYyxCYyxDYyxEYyxGY10sUWM9e2I6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IG5iKGEpKS53YihiPj4+MCxjPj4+MCk7b2I9YTtwYisrO3Rocm93IG9iO30sZGE6ZnVuY3Rpb24oYSl7T2MoYT4+PjAsIUEsMSwhcGEsMTMxMDcyLCExKTtNLkZiKCl9LEQ6ZnVuY3Rpb24oYSl7YT4+Pj0wO0Q/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOk0uRGIoTS5rYlthXSl9LFY6cmIseDpzYixrYTp0YixSOnhiLFQ6eWIsSzp6YixpYTpBYixhYTpCYixnYTpDYixGOkRiLFM6RWIsUDpGYixqYTpHYixROkhiLEk6ZnVuY3Rpb24oYSxiLGMsZCxlKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtiPVIoYik7dmFyIGY9LTEhPWIuaW5kZXhPZihcInVcIik7ZiYmKGU9KDFuPDw2NG4pLTFuKTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6az0+ayx0b1dpcmVUeXBlOmZ1bmN0aW9uKGssXG5sKXtpZihcImJpZ2ludFwiIT10eXBlb2YgbCYmXCJudW1iZXJcIiE9dHlwZW9mIGwpdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IGNvbnZlcnQgXCIke0liKGwpfVwiIHRvICR7dGhpcy5uYW1lfWApO2lmKGw8ZHx8bD5lKXRocm93IG5ldyBUeXBlRXJyb3IoYFBhc3NpbmcgYSBudW1iZXIgXCIke0liKGwpfVwiIGZyb20gSlMgc2lkZSB0byBDL0MrKyBzaWRlIHRvIGFuIGFyZ3VtZW50IG9mIHR5cGUgXCIke2J9XCIsIHdoaWNoIGlzIG91dHNpZGUgdGhlIHZhbGlkIHJhbmdlIFske2R9LCAke2V9XSFgKTtyZXR1cm4gbH0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpPYihiLGMsIWYpLHNiOm51bGx9KX0scGE6ZnVuY3Rpb24oYSxiLGMsZCl7YT4+Pj0wO2I9UihiPj4+MCk7VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmZ1bmN0aW9uKGUpe3JldHVybiEhZX0sdG9XaXJlVHlwZTpmdW5jdGlvbihlLGYpe3JldHVybiBmP2M6ZH0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUodCgpW2U+Pj5cbjBdKX0sc2I6bnVsbH0pfSxvYTpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPVIoYj4+PjApO1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpjPT57dmFyIGQ9VihjKTtRYihjKTtyZXR1cm4gZH0sdG9XaXJlVHlwZTooYyxkKT0+VyhkKSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlJiLHNiOm51bGx9KX0sSDpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wO2M+Pj49MDtiPVIoYj4+PjApO1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpkPT5kLHRvV2lyZVR5cGU6KGQsZSk9PmUsYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpTYihiLGMpLHNiOm51bGx9KX0sdTpmdW5jdGlvbihhLGIsYyxkLGUpe2E+Pj49MDtjPj4+PTA7Yj1SKGI+Pj4wKTstMT09PWUmJihlPTQyOTQ5NjcyOTUpO2U9bD0+bDtpZigwPT09ZCl7dmFyIGY9MzItOCpjO2U9bD0+bDw8Zj4+PmZ9dmFyIGs9Yi5pbmNsdWRlcyhcInVuc2lnbmVkXCIpP2Z1bmN0aW9uKGwscil7cmV0dXJuIHI+Pj4wfTpcbmZ1bmN0aW9uKGwscil7cmV0dXJuIHJ9O1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTplLHRvV2lyZVR5cGU6ayxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOk9iKGIsYywwIT09ZCksc2I6bnVsbH0pfSxuOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGYpe3ZhciBrPXcoKVtmPj4+Mj4+PjBdO2Y9dygpW2YrND4+PjI+Pj4wXTtyZXR1cm4gbmV3IGUoZygpLmJ1ZmZlcixmLGspfWE+Pj49MDt2YXIgZT1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXksQmlnSW50NjRBcnJheSxCaWdVaW50NjRBcnJheV1bYl07Yz1SKGM+Pj4wKTtUKGEse25hbWU6Yyxmcm9tV2lyZVR5cGU6ZCxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOmR9LHtLYjohMH0pfSxKOmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2I9UihiPj4+MCk7dmFyIGM9XCJzdGQ6OnN0cmluZ1wiPT09XG5iO1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihkKXt2YXIgZT13KClbZD4+PjI+Pj4wXSxmPWQrNDtpZihjKWZvcih2YXIgaz1mLGw9MDtsPD1lOysrbCl7dmFyIHI9ZitsO2lmKGw9PWV8fDA9PXQoKVtyPj4+MF0pe2s9TChrLHItayk7aWYodm9pZCAwPT09bil2YXIgbj1rO2Vsc2Ugbis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSxuKz1rO2s9cisxfX1lbHNle249QXJyYXkoZSk7Zm9yKGw9MDtsPGU7KytsKW5bbF09U3RyaW5nLmZyb21DaGFyQ29kZSh0KClbZitsPj4+MF0pO249bi5qb2luKFwiXCIpfVgoZCk7cmV0dXJuIG59LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZCxlKXtlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXImJihlPW5ldyBVaW50OEFycmF5KGUpKTt2YXIgZj1cInN0cmluZ1wiPT10eXBlb2YgZTtpZighKGZ8fGUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHxlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fGUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXRocm93IG5ldyBTKFwiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZ1wiKTtcbnZhciBrPWMmJmY/dWIoZSk6ZS5sZW5ndGg7dmFyIGw9dGMoNCtrKzEpLHI9bCs0O3coKVtsPj4+Mj4+PjBdPWs7aWYoYyYmZil3YihlLHIsaysxKTtlbHNlIGlmKGYpZm9yKGY9MDtmPGs7KytmKXt2YXIgbj1lLmNoYXJDb2RlQXQoZik7aWYoMjU1PG4pdGhyb3cgWChyKSxuZXcgUyhcIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0c1wiKTt0KClbcitmPj4+MF09bn1lbHNlIGZvcihmPTA7ZjxrOysrZil0KClbcitmPj4+MF09ZVtmXTtudWxsIT09ZCYmZC5wdXNoKFgsbCk7cmV0dXJuIGx9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6VGIsc2IoZCl7WChkKX19KX0sejpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7Yz1SKGMpO2lmKDI9PT1iKXt2YXIgZD1WYjt2YXIgZT1XYjt2YXIgZj1YYjt2YXIgaz0oKT0+ZGEoKTt2YXIgbD0xfWVsc2UgND09PWImJihkPVliLGU9WmIsZj0kYixrPSgpPT53KCksXG5sPTIpO1QoYSx7bmFtZTpjLGZyb21XaXJlVHlwZTpyPT57Zm9yKHZhciBuPXcoKVtyPj4+Mj4+PjBdLHg9aygpLEMsTj1yKzQsaD0wO2g8PW47KytoKXt2YXIgdT1yKzQraCpiO2lmKGg9PW58fDA9PXhbdT4+PmxdKU49ZChOLHUtTiksdm9pZCAwPT09Qz9DPU46KEMrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCksQys9TiksTj11K2J9WChyKTtyZXR1cm4gQ30sdG9XaXJlVHlwZToocixuKT0+e2lmKFwic3RyaW5nXCIhPXR5cGVvZiBuKXRocm93IG5ldyBTKGBDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAke2N9YCk7dmFyIHg9ZihuKSxDPXRjKDQreCtiKTt3KClbQz4+PjJdPXg+Pmw7ZShuLEMrNCx4K2IpO251bGwhPT1yJiZyLnB1c2goWCxDKTtyZXR1cm4gQ30sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpSYixzYihyKXtYKHIpfX0pfSxxYTpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPVIoYj4+PjApO1QoYSx7TGI6ITAsbmFtZTpiLGFyZ1BhY2tBZHZhbmNlOjAsXG5mcm9tV2lyZVR5cGU6KCk9Pnt9LHRvV2lyZVR5cGU6KCk9Pnt9fSl9LG5hOigpPT4xLE46ZnVuY3Rpb24oYSxiKXthPj4+PTA7YT09Yj4+PjA/c2V0VGltZW91dCgoKT0+aGIoKSk6RD9wb3N0TWVzc2FnZSh7dGFyZ2V0VGhyZWFkOmEsY21kOlwiY2hlY2tNYWlsYm94XCJ9KTooYT1NLmtiW2FdKSYmYS5wb3N0TWVzc2FnZSh7Y21kOlwiY2hlY2tNYWlsYm94XCJ9KX0sVzpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yy89MjtjYy5sZW5ndGg9YztkPWQ+Pj4wPj4+Mztmb3IodmFyIGU9MDtlPGM7ZSsrKWNjW2VdPUhbZCsyKmVdP0hbZCsyKmUrMV06aWEoKVtkKzIqZSsxPj4+MF07YT0wPmE/UGFbLWEtMV06TmNbYV07TS5KYj1iO2I9YS5hcHBseShudWxsLGNjKTtNLkpiPTA7cmV0dXJuIGJ9LGNhOmFjLG1hOmZ1bmN0aW9uKGEpe0ImJk0ua2JbYT4+PjBdLnJlZigpfSxzOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7Yz4+Pj0wO2E9VihhPj4+MCk7Yj1lYyhiLFwiZW12YWw6OmFzXCIpO3JldHVybiBmYyhiLFxuYyxhKX0sbzpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9Z2NbYT4+PjBdO2I9VihiPj4+MCk7cmV0dXJuIGEobnVsbCxiLGMsZCl9LGo6ZnVuY3Rpb24oYSxiLGMsZCxlKXtjPj4+PTA7ZD4+Pj0wO2U+Pj49MDthPWdjW2E+Pj4wXTtiPVYoYj4+PjApO2M9aWMoYyk7cmV0dXJuIGEoYixiW2NdLGQsZSl9LGM6UWIsQTpmdW5jdGlvbihhLGIpe2I+Pj49MDthPVYoYT4+PjApO2I9VihiKTtyZXR1cm4gYT09Yn0sbTpmdW5jdGlvbihhKXthPj4+PTA7aWYoMD09PWEpcmV0dXJuIFcoamMoKSk7YT1pYyhhKTtyZXR1cm4gVyhqYygpW2FdKX0saTpmdW5jdGlvbihhLGIsYyl7Yj1sYyhhLGI+Pj4wKTt2YXIgZD1iLnNoaWZ0KCk7YS0tO3ZhciBlPVwicmV0dXJuIGZ1bmN0aW9uIChvYmosIGZ1bmMsIGRlc3RydWN0b3JzUmVmLCBhcmdzKSB7XFxuXCIsZj0wLGs9W107MD09PWMmJmsucHVzaChcIm9ialwiKTtmb3IodmFyIGw9W1wicmV0VHlwZVwiXSxyPVtkXSxuPTA7bjxhOysrbilrLnB1c2goXCJhcmdcIitcbm4pLGwucHVzaChcImFyZ1R5cGVcIituKSxyLnB1c2goYltuXSksZSs9YCAgdmFyIGFyZyR7bn0gPSBhcmdUeXBlJHtufS5yZWFkVmFsdWVGcm9tUG9pbnRlcihhcmdzJHtmP1wiK1wiK2Y6XCJcIn0pO1xcbmAsZis9YltuXS5hcmdQYWNrQWR2YW5jZTtlKz1gICB2YXIgcnYgPSAkezE9PT1jP1wibmV3IGZ1bmNcIjpcImZ1bmMuY2FsbFwifSgke2suam9pbihcIiwgXCIpfSk7XFxuYDtmb3Iobj0wO248YTsrK24pYltuXS5kZWxldGVPYmplY3QmJihlKz1gICBhcmdUeXBlJHtufS5kZWxldGVPYmplY3QoYXJnJHtufSk7XFxuYCk7ZC5MYnx8KGwucHVzaChcImVtdmFsX3JldHVyblZhbHVlXCIpLHIucHVzaChmYyksZSs9XCIgIHJldHVybiBlbXZhbF9yZXR1cm5WYWx1ZShyZXRUeXBlLCBkZXN0cnVjdG9yc1JlZiwgcnYpO1xcblwiKTtsLnB1c2goZStcIn07XFxuXCIpO2E9b2MobCkuYXBwbHkobnVsbCxyKTtjPWBtZXRob2RDYWxsZXI8KCR7Yi5tYXAoeD0+eC5uYW1lKS5qb2luKFwiLCBcIil9KSA9PiAke2QubmFtZX0+YDtyZXR1cm4ga2MobmMoYyxcbmEpKX0scjpmdW5jdGlvbihhLGIpe2I+Pj49MDthPVYoYT4+PjApO2I9VihiKTtyZXR1cm4gVyhhW2JdKX0sZDpmdW5jdGlvbihhKXthPj4+PTA7NDxhJiYoVS5nZXQoYSkuQ2IrPTEpfSx2OmZ1bmN0aW9uKCl7cmV0dXJuIFcoW10pfSxsOmZ1bmN0aW9uKGEpe2E9VihhPj4+MCk7Zm9yKHZhciBiPUFycmF5KGEubGVuZ3RoKSxjPTA7YzxhLmxlbmd0aDtjKyspYltjXT1hW2NdO3JldHVybiBXKGIpfSxmOmZ1bmN0aW9uKGEpe3JldHVybiBXKGljKGE+Pj4wKSl9LGs6ZnVuY3Rpb24oKXtyZXR1cm4gVyh7fSl9LGg6ZnVuY3Rpb24oYSl7YT4+Pj0wO2Zvcih2YXIgYj1WKGEpO2IubGVuZ3RoOyl7dmFyIGM9Yi5wb3AoKTtiLnBvcCgpKGMpfVFiKGEpfSxnOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7Yz4+Pj0wO2E9VihhPj4+MCk7Yj1WKGIpO2M9VihjKTthW2JdPWN9LGU6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1lYyhhPj4+MCxcIl9lbXZhbF90YWtlX3ZhbHVlXCIpO2E9YS5yZWFkVmFsdWVGcm9tUG9pbnRlcihiKTtcbnJldHVybiBXKGEpfSxaOmZ1bmN0aW9uKGEsYil7YT0tOTAwNzE5OTI1NDc0MDk5Mj5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtiPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7digpW2I+Pj4yPj4+MF09YS5nZXRVVENTZWNvbmRzKCk7digpW2IrND4+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTt2KClbYis4Pj4+Mj4+PjBdPWEuZ2V0VVRDSG91cnMoKTt2KClbYisxMj4+PjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTt2KClbYisxNj4+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7digpW2IrMjA+Pj4yPj4+MF09YS5nZXRVVENGdWxsWWVhcigpLTE5MDA7digpW2IrMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTthPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwO3YoKVtiKzI4Pj4+Mj4+PjBdPWF9LF86ZnVuY3Rpb24oYSxiKXthPS05MDA3MTk5MjU0NzQwOTkyPmF8fDkwMDcxOTkyNTQ3NDA5OTI8YT9OYU46TnVtYmVyKGEpO1xuYj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3YoKVtiPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO3YoKVtiKzQ+Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7digpW2IrOD4+PjI+Pj4wXT1hLmdldEhvdXJzKCk7digpW2IrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7digpW2IrMTY+Pj4yPj4+MF09YS5nZXRNb250aCgpO3YoKVtiKzIwPj4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO3YoKVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7dmFyIGM9KFkoYS5nZXRGdWxsWWVhcigpKT9wYzpxYylbYS5nZXRNb250aCgpXSthLmdldERhdGUoKS0xfDA7digpW2IrMjg+Pj4yPj4+MF09Yzt2KClbYiszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yz0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO2E9KGMhPWQmJmEuZ2V0VGltZXpvbmVPZmZzZXQoKT09XG5NYXRoLm1pbihkLGMpKXwwO3YoKVtiKzMyPj4+Mj4+PjBdPWF9LCQ6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKHYoKVthKzIwPj4+Mj4+PjBdKzE5MDAsdigpW2ErMTY+Pj4yPj4+MF0sdigpW2ErMTI+Pj4yPj4+MF0sdigpW2ErOD4+PjI+Pj4wXSx2KClbYSs0Pj4+Mj4+PjBdLHYoKVthPj4+Mj4+PjBdLDApLGM9digpW2ErMzI+Pj4yPj4+MF0sZD1iLmdldFRpbWV6b25lT2Zmc2V0KCksZT0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksZj0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksaz1NYXRoLm1pbihmLGUpOzA+Yz92KClbYSszMj4+PjI+Pj4wXT1OdW1iZXIoZSE9ZiYmaz09ZCk6MDxjIT0oaz09ZCkmJihlPU1hdGgubWF4KGYsZSksYi5zZXRUaW1lKGIuZ2V0VGltZSgpKzZFNCooKDA8Yz9rOmUpLWQpKSk7digpW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtjPShZKGIuZ2V0RnVsbFllYXIoKSk/XG5wYzpxYylbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7digpW2ErMjg+Pj4yPj4+MF09Yzt2KClbYT4+PjI+Pj4wXT1iLmdldFNlY29uZHMoKTt2KClbYSs0Pj4+Mj4+PjBdPWIuZ2V0TWludXRlcygpO3YoKVthKzg+Pj4yPj4+MF09Yi5nZXRIb3VycygpO3YoKVthKzEyPj4+Mj4+PjBdPWIuZ2V0RGF0ZSgpO3YoKVthKzE2Pj4+Mj4+PjBdPWIuZ2V0TW9udGgoKTt2KClbYSsyMD4+PjI+Pj4wXT1iLmdldFllYXIoKTthPWIuZ2V0VGltZSgpO2lzTmFOKGEpPyh2KClbUGMoKT4+PjI+Pj4wXT02MSxhPS0xKTphLz0xRTM7cmV0dXJuIEJpZ0ludChhKX0sWDpyYyxZOnNjLE06ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQobil7cmV0dXJuKG49bi50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT9uWzFdOlwiR01UXCJ9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7dmFyIGU9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGY9bmV3IERhdGUoZSwwLDEpLGs9bmV3IERhdGUoZSxcbjYsMSk7ZT1mLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGw9ay5nZXRUaW1lem9uZU9mZnNldCgpLHI9TWF0aC5tYXgoZSxsKTt3KClbYT4+PjI+Pj4wXT02MCpyO3YoKVtiPj4+Mj4+PjBdPU51bWJlcihlIT1sKTthPWQoZik7Yj1kKGspO2E9dWMoYSk7Yj11YyhiKTtsPGU/KHcoKVtjPj4+Mj4+PjBdPWEsdygpW2MrND4+PjI+Pj4wXT1iKToodygpW2M+Pj4yPj4+MF09Yix3KClbYys0Pj4+Mj4+PjBdPWEpfSxwOigpPT57emEoXCJcIil9LHJhOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDt2Yy5sZW5ndGg9MDtmb3IodmFyIGQ7ZD10KClbYisrPj4+MF07KXt2YXIgZT0xMDUhPWQ7ZSY9MTEyIT1kO2MrPWUmJmMlOD80OjA7dmMucHVzaCgxMTI9PWQ/dygpW2M+Pj4yPj4+MF06MTA2PT1kP0hbYz4+PjNdOjEwNT09ZD92KClbYz4+PjI+Pj4wXTppYSgpW2M+Pj4zPj4+MF0pO2MrPWU/ODo0fXJldHVybiBQYVthXS5hcHBseShudWxsLHZjKX0sRTooKT0+e30sRzooKT0+XG5EYXRlLm5vdygpLGxhOigpPT57Tys9MTt0aHJvd1widW53aW5kXCI7fSxPOmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LHQ6KCk9PnBlcmZvcm1hbmNlLnRpbWVPcmlnaW4rcGVyZm9ybWFuY2Uubm93KCksdzooKT0+Qj9yZXF1aXJlKFwib3NcIikuY3B1cygpLmxlbmd0aDpuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSxMOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj10KCkubGVuZ3RoO2lmKGE8PWJ8fDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZT1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntlPShlLm1pbi5jYWxsKGUsNDI5NDkwMTc2MCxkKyg2NTUzNi1kJTY1NTM2KSU2NTUzNiktbS5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e20uZ3JvdyhlKTtxKCk7dmFyIGY9MTticmVhayBhfWNhdGNoKGspe31mPXZvaWQgMH1pZihmKXJldHVybiEwfXJldHVybiExfSxcbmVhOnpjLGZhOkFjLFU6Y2IseTpCYyxDOkNjLGJhOkRjLEI6RmMsYTptfHx6Lndhc21NZW1vcnksaGE6S2MscTpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gS2MoYT4+PjAsYj4+PjAsYz4+PjAsZD4+PjApfX0sWj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyxkKXtaPWMuZXhwb3J0cztaPVJjKCk7TS5HYi5wdXNoKFouWWEpO2xiPVouJGE7R2EudW5zaGlmdChaLnNhKTtBYT1kO0phKCk7cmV0dXJuIFp9dmFyIGI9e2E6UWN9O0krKztpZih6Lmluc3RhbnRpYXRlV2FzbSl0cnl7cmV0dXJuIHouaW5zdGFudGlhdGVXYXNtKGIsYSl9Y2F0Y2goYyl7RihgTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogJHtjfWApLGxhKGMpfU9hKGIsZnVuY3Rpb24oYyl7YShjLmluc3RhbmNlLGMubW9kdWxlKX0pLmNhdGNoKGxhKTtyZXR1cm57fX0oKTt6Ll9PcnRJbml0PShhLGIpPT4oei5fT3J0SW5pdD1aLnRhKShhLGIpO1xuei5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4oei5fT3J0R2V0TGFzdEVycm9yPVoudWEpKGEsYik7ei5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGQsZSxmLGssbCxyLG4pPT4oei5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9Wi52YSkoYSxiLGMsZCxlLGYsayxsLHIsbik7ei5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9Pih6Ll9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1aLndhKShhLGIpO3ouX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4oei5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPVoueGEpKGEsYixjKTt6Ll9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KHouX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1aLnlhKShhLGIsYyk7ei5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9Pih6Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi56YSkoYSk7XG56Ll9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9Pih6Ll9PcnRDcmVhdGVTZXNzaW9uPVouQWEpKGEsYixjKTt6Ll9PcnRSZWxlYXNlU2Vzc2lvbj1hPT4oei5fT3J0UmVsZWFzZVNlc3Npb249Wi5CYSkoYSk7ei5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oei5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1aLkNhKShhLGIsYyk7ei5fT3J0R2V0SW5wdXROYW1lPShhLGIpPT4oei5fT3J0R2V0SW5wdXROYW1lPVouRGEpKGEsYik7ei5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KHouX09ydEdldE91dHB1dE5hbWU9Wi5FYSkoYSxiKTt6Ll9PcnRGcmVlPWE9Pih6Ll9PcnRGcmVlPVouRmEpKGEpO3ouX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxlLGYpPT4oei5fT3J0Q3JlYXRlVGVuc29yPVouR2EpKGEsYixjLGQsZSxmKTt6Ll9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGUpPT4oei5fT3J0R2V0VGVuc29yRGF0YT1aLkhhKShhLGIsYyxkLGUpO1xuei5fT3J0UmVsZWFzZVRlbnNvcj1hPT4oei5fT3J0UmVsZWFzZVRlbnNvcj1aLklhKShhKTt6Ll9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KHouX09ydENyZWF0ZVJ1bk9wdGlvbnM9Wi5KYSkoYSxiLGMsZCk7ei5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KHouX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVouS2EpKGEsYixjKTt6Ll9PcnRSZWxlYXNlUnVuT3B0aW9ucz1hPT4oei5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Wi5MYSkoYSk7ei5fT3J0Q3JlYXRlQmluZGluZz1hPT4oei5fT3J0Q3JlYXRlQmluZGluZz1aLk1hKShhKTt6Ll9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KHouX09ydEJpbmRJbnB1dD1aLk5hKShhLGIsYyk7ei5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9Pih6Ll9PcnRCaW5kT3V0cHV0PVouT2EpKGEsYixjLGQpO3ouX09ydENsZWFyQm91bmRPdXRwdXRzPWE9Pih6Ll9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLlBhKShhKTtcbnouX09ydFJlbGVhc2VCaW5kaW5nPWE9Pih6Ll9PcnRSZWxlYXNlQmluZGluZz1aLlFhKShhKTt6Ll9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxlKT0+KHouX09ydFJ1bldpdGhCaW5kaW5nPVouUmEpKGEsYixjLGQsZSk7ei5fT3J0UnVuPShhLGIsYyxkLGUsZixrLGwpPT4oei5fT3J0UnVuPVouU2EpKGEsYixjLGQsZSxmLGssbCk7ei5fT3J0RW5kUHJvZmlsaW5nPWE9Pih6Ll9PcnRFbmRQcm9maWxpbmc9Wi5UYSkoYSk7dmFyIFBjPSgpPT4oUGM9Wi5VYSkoKSxnYj16Ll9wdGhyZWFkX3NlbGY9KCk9PihnYj16Ll9wdGhyZWFkX3NlbGY9Wi5WYSkoKSx0Yz16Ll9tYWxsb2M9YT0+KHRjPXouX21hbGxvYz1aLldhKShhKSxYPXouX2ZyZWU9YT0+KFg9ei5fZnJlZT1aLlhhKShhKTt6Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD0oKT0+KHouX19lbXNjcmlwdGVuX3Rsc19pbml0PVouWWEpKCk7dmFyIGRjPWE9PihkYz1aLlphKShhKTtcbnouX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5ncz0oKT0+KHouX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5ncz1aLl9hKSgpO3ZhciBPYz16Ll9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD0oYSxiLGMsZCxlLGYpPT4oT2M9ei5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9Wi5hYikoYSxiLGMsZCxlLGYpO3ouX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPSgpPT4oei5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9Wi5iYikoKTt2YXIgJGE9KGEsYixjLGQpPT4oJGE9Wi5jYikoYSxiLGMsZCksZmI9YT0+KGZiPVouZGIpKGEpLG1iPXouX19lbXNjcmlwdGVuX3RocmVhZF9leGl0PWE9PihtYj16Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1aLmViKShhKSxiYz0oKT0+KGJjPVouZmIpKCksamI9KGEsYik9PihqYj1aLmdiKShhLGIpLFdhPSgpPT4oV2E9Wi5oYikoKSxYYT1hPT4oWGE9Wi5pYikoYSksWmE9YT0+KFphPVouamIpKGEpO1xuZnVuY3Rpb24gUmMoKXt2YXIgYT1aO2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1kPT4oKT0+ZCgpPj4+MCxjPWQ9PmU9PmQoZSk+Pj4wO2EuVWE9YihhLlVhKTthLlZhPWIoYS5WYSk7YS5XYT1jKGEuV2EpO2EuWmE9YyhhLlphKTthLmVtc2NyaXB0ZW5fbWFpbl9ydW50aW1lX3RocmVhZF9pZD1iKGEuZW1zY3JpcHRlbl9tYWluX3J1bnRpbWVfdGhyZWFkX2lkKTthLmhiPWIoYS5oYik7YS5qYj1jKGEuamIpO3JldHVybiBhfXoud2FzbU1lbW9yeT1tO3ouc3RhY2tBbGxvYz1aYTt6LnN0YWNrU2F2ZT1XYTt6LnN0YWNrUmVzdG9yZT1YYTt6LmtlZXBSdW50aW1lQWxpdmU9KCk9PjA8Tzt6LlVURjhUb1N0cmluZz1MO3ouc3RyaW5nVG9VVEY4PXdiO3oubGVuZ3RoQnl0ZXNVVEY4PXViO3ouRXhpdFN0YXR1cz1RYTt6LlBUaHJlYWQ9TTt2YXIgU2M7Sj1mdW5jdGlvbiBUYygpe1NjfHxVYygpO1NjfHwoSj1UYyl9O1xuZnVuY3Rpb24gVWMoKXtpZighKDA8SSkpaWYoRClrYSh6KSxEfHxpYihHYSksc3RhcnRXb3JrZXIoeik7ZWxzZXtpZih6LnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2Ygei5wcmVSdW4mJih6LnByZVJ1bj1bei5wcmVSdW5dKTt6LnByZVJ1bi5sZW5ndGg7KUZhLnVuc2hpZnQoei5wcmVSdW4uc2hpZnQoKSk7aWIoRmEpOzA8SXx8U2N8fChTYz0hMCx6LmNhbGxlZFJ1bj0hMCxCYXx8KER8fGliKEdhKSxrYSh6KSxEfHxpYihIYSkpKX19VWMoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cbik7XG59KSgpO1xuO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtVGhyZWFkZWQ7XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbVRocmVhZGVkKTtcbiIsICJcInVzZSBzdHJpY3RcIjt2YXIgTW9kdWxlPXt9O3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09XCJzdHJpbmdcIjtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgbm9kZVdvcmtlclRocmVhZHM9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO3ZhciBwYXJlbnRQb3J0PW5vZGVXb3JrZXJUaHJlYWRzLnBhcmVudFBvcnQ7cGFyZW50UG9ydC5vbihcIm1lc3NhZ2VcIixkYXRhPT5vbm1lc3NhZ2Uoe2RhdGE6ZGF0YX0pKTt2YXIgZnM9cmVxdWlyZShcImZzXCIpO3ZhciB2bT1yZXF1aXJlKFwidm1cIik7T2JqZWN0LmFzc2lnbihnbG9iYWwse3NlbGY6Z2xvYmFsLHJlcXVpcmU6cmVxdWlyZSxNb2R1bGU6TW9kdWxlLGxvY2F0aW9uOntocmVmOl9fZmlsZW5hbWV9LFdvcmtlcjpub2RlV29ya2VyVGhyZWFkcy5Xb3JrZXIsaW1wb3J0U2NyaXB0czpmPT52bS5ydW5JblRoaXNDb250ZXh0KGZzLnJlYWRGaWxlU3luYyhmLFwidXRmOFwiKSx7ZmlsZW5hbWU6Zn0pLHBvc3RNZXNzYWdlOm1zZz0+cGFyZW50UG9ydC5wb3N0TWVzc2FnZShtc2cpLHBlcmZvcm1hbmNlOmdsb2JhbC5wZXJmb3JtYW5jZXx8e25vdzpEYXRlLm5vd319KX12YXIgaW5pdGlhbGl6ZWRKUz1mYWxzZTtmdW5jdGlvbiB0aHJlYWRQcmludEVycigpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7ZnMud3JpdGVTeW5jKDIsdGV4dCtcIlxcblwiKTtyZXR1cm59Y29uc29sZS5lcnJvcih0ZXh0KX1mdW5jdGlvbiB0aHJlYWRBbGVydCgpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7cG9zdE1lc3NhZ2Uoe2NtZDpcImFsZXJ0XCIsdGV4dDp0ZXh0LHRocmVhZElkOk1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKX0pfXZhciBlcnI9dGhyZWFkUHJpbnRFcnI7c2VsZi5hbGVydD10aHJlYWRBbGVydDtNb2R1bGVbXCJpbnN0YW50aWF0ZVdhc21cIl09KGluZm8scmVjZWl2ZUluc3RhbmNlKT0+e3ZhciBtb2R1bGU9TW9kdWxlW1wid2FzbU1vZHVsZVwiXTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPW51bGw7dmFyIGluc3RhbmNlPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShtb2R1bGUsaW5mbyk7cmV0dXJuIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSl9O3NlbGYub251bmhhbmRsZWRyZWplY3Rpb249ZT0+e3Rocm93IGUucmVhc29ufHxlfTtmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGUpe3RyeXtpZihlLmRhdGEuY21kPT09XCJsb2FkXCIpe2xldCBtZXNzYWdlUXVldWU9W107c2VsZi5vbm1lc3NhZ2U9ZT0+bWVzc2FnZVF1ZXVlLnB1c2goZSk7c2VsZi5zdGFydFdvcmtlcj1pbnN0YW5jZT0+e01vZHVsZT1pbnN0YW5jZTtwb3N0TWVzc2FnZSh7XCJjbWRcIjpcImxvYWRlZFwifSk7Zm9yKGxldCBtc2cgb2YgbWVzc2FnZVF1ZXVlKXtoYW5kbGVNZXNzYWdlKG1zZyl9c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZX07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1lLmRhdGEud2FzbU1vZHVsZTtmb3IoY29uc3QgaGFuZGxlciBvZiBlLmRhdGEuaGFuZGxlcnMpe01vZHVsZVtoYW5kbGVyXT0oLi4uYXJncyk9Pntwb3N0TWVzc2FnZSh7Y21kOlwiY2FsbEhhbmRsZXJcIixoYW5kbGVyOmhhbmRsZXIsYXJnczphcmdzfSl9fU1vZHVsZVtcIndhc21NZW1vcnlcIl09ZS5kYXRhLndhc21NZW1vcnk7TW9kdWxlW1wiYnVmZmVyXCJdPU1vZHVsZVtcIndhc21NZW1vcnlcIl0uYnVmZmVyO01vZHVsZVtcIkVOVklST05NRU5UX0lTX1BUSFJFQURcIl09dHJ1ZTtpZih0eXBlb2YgZS5kYXRhLnVybE9yQmxvYj09XCJzdHJpbmdcIil7aW1wb3J0U2NyaXB0cyhlLmRhdGEudXJsT3JCbG9iKX1lbHNle3ZhciBvYmplY3RVcmw9VVJMLmNyZWF0ZU9iamVjdFVSTChlLmRhdGEudXJsT3JCbG9iKTtpbXBvcnRTY3JpcHRzKG9iamVjdFVybCk7VVJMLnJldm9rZU9iamVjdFVSTChvYmplY3RVcmwpfW9ydFdhc21UaHJlYWRlZChNb2R1bGUpfWVsc2UgaWYoZS5kYXRhLmNtZD09PVwicnVuXCIpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdFwiXShlLmRhdGEucHRocmVhZF9wdHIsLyppc19tYWluPSovMCwvKmlzX3J1bnRpbWU9Ki8wLC8qY2FuX2Jsb2NrPSovMSk7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0XCJdKGUuZGF0YS5wdGhyZWFkX3B0cik7TW9kdWxlW1wiZXN0YWJsaXNoU3RhY2tTcGFjZVwiXSgpO01vZHVsZVtcIlBUaHJlYWRcIl0ucmVjZWl2ZU9iamVjdFRyYW5zZmVyKGUuZGF0YSk7TW9kdWxlW1wiUFRocmVhZFwiXS50aHJlYWRJbml0VExTKCk7aWYoIWluaXRpYWxpemVkSlMpe01vZHVsZVtcIl9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3NcIl0oKTtpbml0aWFsaXplZEpTPXRydWV9dHJ5e01vZHVsZVtcImludm9rZUVudHJ5UG9pbnRcIl0oZS5kYXRhLnN0YXJ0X3JvdXRpbmUsZS5kYXRhLmFyZyl9Y2F0Y2goZXgpe2lmKGV4IT1cInVud2luZFwiKXt0aHJvdyBleH19fWVsc2UgaWYoZS5kYXRhLmNtZD09PVwiY2FuY2VsXCIpe2lmKE1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKSl7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9leGl0XCJdKC0xKX19ZWxzZSBpZihlLmRhdGEudGFyZ2V0PT09XCJzZXRpbW1lZGlhdGVcIil7fWVsc2UgaWYoZS5kYXRhLmNtZD09PVwiY2hlY2tNYWlsYm94XCIpe2lmKGluaXRpYWxpemVkSlMpe01vZHVsZVtcImNoZWNrTWFpbGJveFwiXSgpfX1lbHNlIGlmKGUuZGF0YS5jbWQpe2Vycihgd29ya2VyLmpzIHJlY2VpdmVkIHVua25vd24gY29tbWFuZCAke2UuZGF0YS5jbWR9YCk7ZXJyKGUuZGF0YSl9fWNhdGNoKGV4KXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWRcIl0/LigpO3Rocm93IGV4fX1zZWxmLm9ubWVzc2FnZT1oYW5kbGVNZXNzYWdlO1xuIiwgImV4cG9ydCBjb25zdCBqb2luID0gdW5kZWZpbmVkOyIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHtFbnZ9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7T3J0V2FzbU1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtJztcbmltcG9ydCB7T3J0V2FzbVRocmVhZGVkTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5sZXQgb3J0V2FzbUZhY3Rvcnk6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+O1xuXG5pZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICBvcnRXYXNtRmFjdG9yeSA9IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzJyk7XG59IGVsc2Uge1xuICBvcnRXYXNtRmFjdG9yeSA9XG4gICAgICBCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLmpzJykgOiByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC5qc2VwLmpzJyk7XG59XG5cbmNvbnN0IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQ6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+ID0gIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCA/XG4gICAgKEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQuanMnKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLmpzJykpIDpcbiAgICBvcnRXYXNtRmFjdG9yeTtcbi8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xuXG5sZXQgd2FzbTogT3J0V2FzbU1vZHVsZXx1bmRlZmluZWQ7XG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmxldCBpbml0aWFsaXppbmcgPSBmYWxzZTtcbmxldCBhYm9ydGVkID0gZmFsc2U7XG5cbmNvbnN0IGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gSWYgJ1NoYXJlZEFycmF5QnVmZmVyJyBpcyBub3QgYXZhaWxhYmxlLCBXZWJBc3NlbWJseSB0aHJlYWRzIHdpbGwgbm90IHdvcmsuXG4gICAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IGZvciB0cmFuc2ZlcmFiaWxpdHkgb2YgU0FCcyAoZm9yIGJyb3dzZXJzLiBuZWVkZWQgZm9yIEZpcmVmb3gpXG4gICAgLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIW1zZy9tb3ppbGxhLmRldi5wbGF0Zm9ybS9JSGtCWmxIRVRwQS9kd3NNTmNoV0VRQUpcbiAgICBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbmV3IE1lc3NhZ2VDaGFubmVsKCkucG9ydDEucG9zdE1lc3NhZ2UobmV3IFNoYXJlZEFycmF5QnVmZmVyKDEpKTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSB0aHJlYWRzIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgdGhyZWFkZWQgaW5zdHJ1Y3Rpb25zLlxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCA5NywgMTE1LCAxMDksIDEsIDAsICAwLCAgMCwgMSwgNCwgMSwgIDk2LCAwLCAgIDAsICAzLCAyLCAxLCAgMCwgNSxcbiAgICAgIDQsIDEsICAzLCAgIDEsICAgMSwgMTAsIDExLCAxLCA5LCAwLCA2NSwgMCwgIDI1NCwgMTYsIDIsIDAsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgaXNTaW1kU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IFNJTUQgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyBTSU1EIGluc3RydWN0aW9ucy5cblxuICAgIC8vIFRoZSBiaW5hcnkgZGF0YSBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZm9sbG93aW5nIGNvZGUgYnkgd2F0Mndhc206XG4gICAgLy9cbiAgICAvLyAobW9kdWxlXG4gICAgLy8gICAodHlwZSAkdDAgKGZ1bmMpKVxuICAgIC8vICAgKGZ1bmMgJGYwICh0eXBlICR0MClcbiAgICAvLyAgICAgKGRyb3BcbiAgICAvLyAgICAgICAoaTMyeDQuZG90X2kxNng4X3NcbiAgICAvLyAgICAgICAgIChpOHgxNi5zcGxhdFxuICAgIC8vICAgICAgICAgICAoaTMyLmNvbnN0IDApKVxuICAgIC8vICAgICAgICAgKHYxMjguY29uc3QgaTMyeDQgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCkpKSkpXG5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgICA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCAxMCwgMzAsIDEsICAgMjgsICAwLCA2NSwgMCxcbiAgICAgIDI1MywgMTUsIDI1MywgMTIsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsICAyNTMsIDE4NiwgMSwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBnZXRXYXNtRmlsZU5hbWUgPSAodXNlU2ltZDogYm9vbGVhbiwgdXNlVGhyZWFkczogYm9vbGVhbikgPT4ge1xuICBpZiAodXNlU2ltZCkge1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gICAgICByZXR1cm4gJ29ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbSc7XG4gICAgfVxuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20tc2ltZC53YXNtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS53YXNtJztcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVXZWJBc3NlbWJseSA9IGFzeW5jKGZsYWdzOiBFbnYuV2ViQXNzZW1ibHlGbGFncyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgaWYgKGluaXRpYWxpemluZykge1xuICAgIHRocm93IG5ldyBFcnJvcignbXVsdGlwbGUgY2FsbHMgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZGV0ZWN0ZWQuJyk7XG4gIH1cbiAgaWYgKGFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZmFpbGVkLicpO1xuICB9XG5cbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAvLyB3YXNtIGZsYWdzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkXG4gIGNvbnN0IHRpbWVvdXQgPSBmbGFncy5pbml0VGltZW91dCE7XG4gIGNvbnN0IG51bVRocmVhZHMgPSBmbGFncy5udW1UaHJlYWRzITtcbiAgY29uc3Qgc2ltZCA9IGZsYWdzLnNpbWQhO1xuXG4gIGNvbnN0IHVzZVRocmVhZHMgPSBudW1UaHJlYWRzID4gMSAmJiBpc011bHRpVGhyZWFkU3VwcG9ydGVkKCk7XG4gIGNvbnN0IHVzZVNpbWQgPSBzaW1kICYmIGlzU2ltZFN1cHBvcnRlZCgpO1xuXG4gIGNvbnN0IHdhc21QYXRocyA9IGZsYWdzLndhc21QYXRocztcbiAgY29uc3Qgd2FzbVByZWZpeE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ3N0cmluZycgPyB3YXNtUGF0aHMgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHdhc21GaWxlTmFtZSA9IGdldFdhc21GaWxlTmFtZSh1c2VTaW1kLCB1c2VUaHJlYWRzKTtcbiAgY29uc3Qgd2FzbVBhdGhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdvYmplY3QnID8gd2FzbVBhdGhzW3dhc21GaWxlTmFtZV0gOiB1bmRlZmluZWQ7XG5cbiAgbGV0IGlzVGltZW91dCA9IGZhbHNlO1xuXG4gIGNvbnN0IHRhc2tzOiBBcnJheTxQcm9taXNlPHZvaWQ+PiA9IFtdO1xuXG4gIC8vIHByb21pc2UgZm9yIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgPiAwKSB7XG4gICAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlzVGltZW91dCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8vIHByb21pc2UgZm9yIG1vZHVsZSBpbml0aWFsaXphdGlvblxuICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBmYWN0b3J5ID0gdXNlVGhyZWFkcyA/IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQgOiBvcnRXYXNtRmFjdG9yeTtcbiAgICBjb25zdCBjb25maWc6IFBhcnRpYWw8T3J0V2FzbU1vZHVsZT4gPSB7XG4gICAgICBsb2NhdGVGaWxlOiAoZmlsZU5hbWU6IHN0cmluZywgc2NyaXB0RGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLndvcmtlci5qcycpICYmXG4gICAgICAgICAgICB0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgcmVxdWlyZSgpIGZ1bmN0aW9uIGlzIGhhbmRsZWQgYnkgZXNidWlsZCBwbHVnaW4gdG8gbG9hZCBmaWxlIGNvbnRlbnQgYXMgc3RyaW5nLlxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzXG4gICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcycpXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLndhc20nKSkge1xuICAgICAgICAgIGlmICh3YXNtUGF0aE92ZXJyaWRlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2FzbVBhdGhPdmVycmlkZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBwcmVmaXggPSB3YXNtUHJlZml4T3ZlcnJpZGUgPz8gc2NyaXB0RGlyZWN0b3J5O1xuXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgICAgICBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC53YXNtJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJ29ydC13YXNtLXNpbWQuanNlcC53YXNtJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgd2FzbUZpbGVOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmlwdERpcmVjdG9yeSArIGZpbGVOYW1lO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzKSB7XG4gICAgICBjb25maWcubnVtVGhyZWFkcyA9IG51bVRocmVhZHM7XG4gICAgICBpZiAodHlwZW9mIEJsb2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ29ydC13YXNtLXRocmVhZGVkLmpzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzY3JpcHRTb3VyY2VDb2RlID0gYHZhciBvcnRXYXNtVGhyZWFkZWQ9JHtmYWN0b3J5LnRvU3RyaW5nKCl9O2A7XG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gbmV3IEJsb2IoW3NjcmlwdFNvdXJjZUNvZGVdLCB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmYWN0b3J5KGNvbmZpZykudGhlbihcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgIG1vZHVsZSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHdhc20gPSBtb2R1bGU7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBmYWlsZWQgdG8gaW5pdGlhbGl6ZVxuICAgICAgICAod2hhdCkgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlamVjdCh3aGF0KTtcbiAgICAgICAgfSk7XG4gIH0pKTtcblxuICBhd2FpdCBQcm9taXNlLnJhY2UodGFza3MpO1xuXG4gIGlmIChpc1RpbWVvdXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFdlYkFzc2VtYmx5IGJhY2tlbmQgaW5pdGlhbGl6aW5nIGZhaWxlZCBkdWUgdG8gdGltZW91dDogJHt0aW1lb3V0fW1zYCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRJbnN0YW5jZSA9ICgpOiBPcnRXYXNtTW9kdWxlID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmIHdhc20pIHtcbiAgICByZXR1cm4gd2FzbTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignV2ViQXNzZW1ibHkgaXMgbm90IGluaXRpYWxpemVkIHlldC4nKTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwb3NlID0gKCk6IHZvaWQgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgIWluaXRpYWxpemluZyAmJiAhYWJvcnRlZCkge1xuICAgIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgICAod2FzbSBhcyBPcnRXYXNtVGhyZWFkZWRNb2R1bGUpLlBUaHJlYWQ/LnRlcm1pbmF0ZUFsbFRocmVhZHMoKTtcbiAgICB3YXNtID0gdW5kZWZpbmVkO1xuXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuXG5leHBvcnQgY29uc3QgYWxsb2NXYXNtU3RyaW5nID0gKGRhdGE6IHN0cmluZywgYWxsb2NzOiBudW1iZXJbXSk6IG51bWJlciA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IGRhdGFMZW5ndGggPSB3YXNtLmxlbmd0aEJ5dGVzVVRGOChkYXRhKSArIDE7XG4gIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MoZGF0YUxlbmd0aCk7XG4gIHdhc20uc3RyaW5nVG9VVEY4KGRhdGEsIGRhdGFPZmZzZXQsIGRhdGFMZW5ndGgpO1xuICBhbGxvY3MucHVzaChkYXRhT2Zmc2V0KTtcblxuICByZXR1cm4gZGF0YU9mZnNldDtcbn07XG5cbmludGVyZmFjZSBFeHRyYU9wdGlvbnNIYW5kbGVyIHtcbiAgKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBpdGVyYXRlRXh0cmFPcHRpb25zID1cbiAgICAob3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHByZWZpeDogc3RyaW5nLCBzZWVuOiBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PixcbiAgICAgaGFuZGxlcjogRXh0cmFPcHRpb25zSGFuZGxlcik6IHZvaWQgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKHNlZW4uaGFzKG9wdGlvbnMpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWxhciByZWZlcmVuY2UgaW4gb3B0aW9ucycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZW4uYWRkKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gKHByZWZpeCkgPyBwcmVmaXggKyBrZXkgOiBrZXk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgbmFtZSArICcuJywgc2VlbiwgaGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCB2YWx1ZS50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgKHZhbHVlKSA/ICcxJyA6ICcwJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBoYW5kbGUgZXh0cmEgY29uZmlnIHR5cGU6ICR7dHlwZW9mIHZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4vKipcbiAqIGNoZWNrIHdlYiBhc3NlbWJseSBBUEkncyBsYXN0IGVycm9yIGFuZCB0aHJvdyBlcnJvciBpZiBhbnkgZXJyb3Igb2NjdXJyZWQuXG4gKiBAcGFyYW0gbWVzc2FnZSBhIG1lc3NhZ2UgdXNlZCB3aGVuIGFuIGVycm9yIG9jY3VycmVkLlxuICovXG5leHBvcnQgY29uc3QgY2hlY2tMYXN0RXJyb3IgPSAobWVzc2FnZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJhbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgd2FzbS5fT3J0R2V0TGFzdEVycm9yKHBhcmFtc09mZnNldCwgcGFyYW1zT2Zmc2V0ICsgNCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5IRUFQMzJbcGFyYW1zT2Zmc2V0IC8gNF07XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlUG9pbnRlciA9IHdhc20uSEVBUFUzMltwYXJhbXNPZmZzZXQgLyA0ICsgMV07XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlUG9pbnRlciA/IHdhc20uVVRGOFRvU3RyaW5nKGVycm9yTWVzc2FnZVBvaW50ZXIpIDogJyc7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke21lc3NhZ2V9IEVSUk9SX0NPREU6ICR7ZXJyb3JDb2RlfSwgRVJST1JfTUVTU0FHRTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuZXhwb3J0IGNvbnN0IHNldFJ1bk9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgY29uc3QgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IHJ1bk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdHJ5IHtcbiAgICBpZiAob3B0aW9ucz8ubG9nU2V2ZXJpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPSAyOyAgLy8gRGVmYXVsdCB0byB3YXJuaW5nXG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgdHlwZW9mIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dTZXZlcml0eUxldmVsKSB8fFxuICAgICAgICBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dTZXZlcml0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5sb2dWZXJib3NpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID0gMDsgIC8vIERlZmF1bHQgdG8gMFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LnRlcm1pbmF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLnRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB0YWdEYXRhT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0aW9ucz8udGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhZ0RhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcob3B0aW9ucy50YWcsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgcnVuT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVJ1bk9wdGlvbnMoXG4gICAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCEsIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwhLCAhIXJ1bk9wdGlvbnMudGVybWluYXRlISwgdGFnRGF0YU9mZnNldCk7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBydW4gb3B0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhvcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFJ1bkNvbmZpZ0VudHJ5KHJ1bk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgcnVuIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbcnVuT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5jb25zdCBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwgPSAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbDogc3RyaW5nfHVua25vd24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwpIHtcbiAgICBjYXNlICdkaXNhYmxlZCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICdleHRlbmRlZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdhbGwnOlxuICAgICAgcmV0dXJuIDk5O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGdyYXBoIG9wdGltaXphdGlvbiBsZXZlbDogJHtncmFwaE9wdGltaXphdGlvbkxldmVsfWApO1xuICB9XG59O1xuXG5jb25zdCBnZXRFeGVjdXRpb25Nb2RlID0gKGV4ZWN1dGlvbk1vZGU6ICdzZXF1ZW50aWFsJ3wncGFyYWxsZWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChleGVjdXRpb25Nb2RlKSB7XG4gICAgY2FzZSAnc2VxdWVudGlhbCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdwYXJhbGxlbCc6XG4gICAgICByZXR1cm4gMTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBleGVjdXRpb24gbW9kZTogJHtleGVjdXRpb25Nb2RlfWApO1xuICB9XG59O1xuXG5jb25zdCBhcHBlbmREZWZhdWx0T3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogdm9pZCA9PiB7XG4gIGlmICghb3B0aW9ucy5leHRyYSkge1xuICAgIG9wdGlvbnMuZXh0cmEgPSB7fTtcbiAgfVxuICBpZiAoIW9wdGlvbnMuZXh0cmEuc2Vzc2lvbikge1xuICAgIG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiA9IHt9O1xuICB9XG4gIGNvbnN0IHNlc3Npb24gPSBvcHRpb25zLmV4dHJhLnNlc3Npb24gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgaWYgKCFzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5ID0gJzEnO1xuICB9XG5cbiAgLy8gaWYgdXNpbmcgSlNFUCB3aXRoIFdlYkdQVSwgYWx3YXlzIGRpc2FibGUgbWVtb3J5IHBhdHRlcm5cbiAgaWYgKG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzICYmXG4gICAgICBvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycy5zb21lKGVwID0+ICh0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lKSA9PT0gJ3dlYmdwdScpKSB7XG4gICAgb3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHNldEV4ZWN1dGlvblByb3ZpZGVycyA9XG4gICAgKHNlc3Npb25PcHRpb25zSGFuZGxlOiBudW1iZXIsIGV4ZWN1dGlvblByb3ZpZGVyczogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5FeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdLFxuICAgICBhbGxvY3M6IG51bWJlcltdKTogdm9pZCA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVwIG9mIGV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgICBsZXQgZXBOYW1lID0gdHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZTtcblxuICAgICAgICAvLyBjaGVjayBFUCBuYW1lXG4gICAgICAgIHN3aXRjaCAoZXBOYW1lKSB7XG4gICAgICAgICAgY2FzZSAnd2Vibm4nOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8uZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdkZXZpY2VUeXBlJyAtICR7d2Vibm5PcHRpb25zLmRldmljZVR5cGV9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5udW1UaHJlYWRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVRocmVhZHMgPSB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcztcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtVGhyZWFkcyAhPSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW1UaHJlYWRzKSB8fCBudW1UaHJlYWRzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgbnVtVGhyZWFkcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ251bVRocmVhZHMnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhudW1UaHJlYWRzLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnbnVtVGhyZWFkcycgLSAke3dlYm5uT3B0aW9ucy5udW1UaHJlYWRzfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTZcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIGVsZW1lbnQgc2l6ZSBpbiBieXRlcyBieSB0aGUgZ2l2ZW4gZGF0YSB0eXBlXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VGVuc29yRWxlbWVudFNpemUgPSAoZGF0ZVR5cGU6IG51bWJlcik6IG51bWJlcnxcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XG5cbi8qKlxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gKHR5cGU6IFRlbnNvci5UeXBlKTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3J8VWludDhBcnJheUNvbnN0cnVjdG9yfFxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDhBcnJheUNvbnN0cnVjdG9yfEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgICAgICBjYXNlICd1aW50OCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDgnOlxuICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnYm9vbCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+IHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICAgIHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAnYm9vbCcgfHwgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICd1aW50MzInO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIFVpbnQ4QXJyYXkuXG4gKlxuICogQHBhcmFtIGZpbGUgLSB0aGUgZmlsZSB0byBsb2FkLiBDYW4gYmUgYSBVUkwvcGF0aCwgYSBCbG9iLCBhbiBBcnJheUJ1ZmZlciwgb3IgYSBVaW50OEFycmF5LlxuICogQHJldHVybnMgYSBVaW50OEFycmF5IGNvbnRhaW5pbmcgdGhlIGZpbGUgZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRGaWxlID0gYXN5bmMoZmlsZTogc3RyaW5nfEJsb2J8QXJyYXlCdWZmZXJMaWtlfFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+ID0+IHtcbiAgaWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIE5vZGUuanNcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZWFkRmlsZShmaWxlKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFUlJfRlNfRklMRV9UT09fTEFSR0UnKSB7XG4gICAgICAgICAgLy8gZmlsZSBpcyB0b28gbGFyZ2UsIHVzZSBmcy5jcmVhdGVSZWFkU3RyZWFtIGluc3RlYWRcbiAgICAgICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KEJ1ZmZlci5jb25jYXQoY2h1bmtzKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gYnJvd3NlcnNcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjb250ZW50TGVuZ3RoSGVhZGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtTGVuZ3RoJyk7XG4gICAgICBjb25zdCBmaWxlU2l6ZSA9IGNvbnRlbnRMZW5ndGhIZWFkZXIgPyBwYXJzZUludChjb250ZW50TGVuZ3RoSGVhZGVyLCAxMCkgOiAwO1xuICAgICAgaWYgKGZpbGVTaXplIDwgMTA3Mzc0MTgyNCAvKiAxR0IgKi8pIHtcbiAgICAgICAgLy8gd2hlbiBDb250ZW50LUxlbmd0aCBoZWFkZXIgaXMgbm90IHNldCwgd2UgY2Fubm90IGRldGVybWluZSB0aGUgZmlsZSBzaXplLiBXZSBhc3N1bWUgaXQgaXMgc21hbGwgZW5vdWdoIHRvXG4gICAgICAgIC8vIGxvYWQgaW50byBtZW1vcnkuXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2Ugc3RyZWFtIGluc3RlYWRcbiAgICAgICAgaWYgKCFyZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gbG9hZCBleHRlcm5hbCBkYXRhIGZpbGU6ICR7ZmlsZX0sIG5vIHJlc3BvbnNlIGJvZHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcblxuICAgICAgICAvLyB1c2UgV2ViQXNzZW1ibHkgTWVtb3J5IHRvIGFsbG9jYXRlIGxhcmdlciBBcnJheUJ1ZmZlclxuICAgICAgICBjb25zdCBwYWdlcyA9IE1hdGguY2VpbChmaWxlU2l6ZSAvIDY1NTM2KTtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDogcGFnZXMsIG1heGltdW06IHBhZ2VzfSkuYnVmZmVyO1xuXG4gICAgICAgIGxldCBvZmZzZXQgPSAwO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaHVua1NpemUgPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGNodW5rU2l6ZSk7XG4gICAgICAgICAgY2h1bmsuc2V0KHZhbHVlKTtcbiAgICAgICAgICBvZmZzZXQgKz0gY2h1bmtTaXplO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShidWZmZXIsIDAsIGZpbGVTaXplKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgQmxvYikge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCBmaWxlLmFycmF5QnVmZmVyKCkpO1xuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgcmV0dXJuIGZpbGU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGZpbGUpO1xuICB9XG59O1xuIiwgImV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgcmVhZEZpbGVTeW5jID0gdW5kZWZpbmVkO2V4cG9ydCBjb25zdCBjcmVhdGVSZWFkU3RyZWFtID0gdW5kZWZpbmVkOyIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciwgU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhLCBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YSwgVGVuc29yTWV0YWRhdGF9IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHtzZXRSdW5PcHRpb25zfSBmcm9tICcuL3J1bi1vcHRpb25zJztcbmltcG9ydCB7c2V0U2Vzc2lvbk9wdGlvbnN9IGZyb20gJy4vc2Vzc2lvbi1vcHRpb25zJztcbmltcG9ydCB7ZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtLCBnZXRUZW5zb3JFbGVtZW50U2l6ZSwgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlLCBsb2dMZXZlbFN0cmluZ1RvRW51bSwgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcsIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtLCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3J9IGZyb20gJy4vd2FzbS1jb21tb24nO1xuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuaW1wb3J0IHtsb2FkRmlsZX0gZnJvbSAnLi93YXNtLXV0aWxzLWxvYWQtZmlsZSc7XG5cbi8vICNyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogVGhlcmUgYXJlIDQgZGlmZmVyZW50IFwiaW5pdGlhbGl6YXRpb25cIiBzdGVwcyBmb3IgT1JULiBUaGV5IGhhcHBlbiBpbiBkaWZmZXJlbnQgcGxhY2VzIGFuZCBkaWZmZXJlbnQgdGltZS5cbiAqXG4gKiAxLiBKYXZhU2NyaXB0IGluaXRpYWxpemF0aW9uIGZvciBvbm54cnVudGltZS1jb21tb24gYW5kIG9ubnhydW50aW1lLXdlYi5cbiAqICAgIFRoaXMgaXMgdGhlIGZpcnN0IGluaXRpYWxpemF0aW9uIHN0ZXAuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGNhbGxzIG9ubnhydW50aW1lLWNvbW1vbidzIHJlZ2lzdGVyQmFja2VuZCgpXG4gKiBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyB0byByZWdpc3RlciBhbGwgdGhlIGF2YWlsYWJsZSBiYWNrZW5kcy4gVGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uIGlzIHZlcnkgZmFzdC4gSXQgb25seVxuICogcmVnaXN0ZXJzIHRoZSBiYWNrZW5kIG5hbWUgd2l0aCB0aGUgdW5pbml0aWFsaXplZCBiYWNrZW5kIG9iamVjdC4gTm8gaGVhdnkgaW5pdGlhbGl6YXRpb24gaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICBSZWZlciB0byB3ZWIvbGliL2luZGV4LnRzIGZvciB0aGUgYmFja2VuZCByZWdpc3RyYXRpb24uXG4gKlxuICogMi4gV2ViQXNzZW1ibHkgYXJ0aWZhY3QgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBhbnkgcmVnaXN0ZXJlZCB3YXNtIGJhY2tlbmQgaXMgdXNlZCBmb3IgdGhlIGZpcnN0IHRpbWUgKGllLiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yXG4gKiBgb3J0LlRyYWluaW5nU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkKS4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGUgZm9sbG93aW5nczpcbiAqICAgICAtIGNyZWF0ZSBhIHByb3h5IHdvcmtlciBhbmQgbWFrZSBzdXJlIHRoZSBwcm94eSB3b3JrZXIgaXMgcmVhZHkgdG8gcmVjZWl2ZSBtZXNzYWdlcywgaWYgcHJveHkgaXMgZW5hYmxlZC5cbiAqICAgICAtIHBlcmZvcm0gZmVhdHVyZSBkZXRlY3Rpb24sIGxvY2F0ZSBjb3JyZWN0IFdlYkFzc2VtYmx5IGFydGlmYWN0IHBhdGggYW5kIGNhbGwgdGhlIEVtc2NyaXB0ZW4gZ2VuZXJhdGVkXG4gKiBKYXZhU2NyaXB0IGNvZGUgdG8gaW5pdGlhbGl6ZSB0aGUgV2ViQXNzZW1ibHkgcnVudGltZS5cbiAqICAgICAgICAgLSBpZiBwcm94eSBpcyBlbmFibGVkLCB0aGlzIHN0ZXAgaGFwcGVucyBpbiB0aGUgcHJveHkgd29ya2VyIHVzaW5nIG1lc3NhZ2UgJ2luaXQtd2FzbScuXG4gKiAgICAgICAgIC0gZG93bmxvYWRpbmcgdGhlICdvcnQtd2FzbXsuLi59Lndhc20nIGZpbGUgaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICAgICAgIC0gaWYgbXVsdGktdGhyZWFkIGlzIGVuYWJsZWQsIG9uZSBvciBtb3JlIHdlYndvcmtlciB3aWxsIGJlIGNyZWF0ZWQgdG8gaW5pdGlhbGl6ZSB0aGUgUFRocmVhZCB0aHJlYWRwb29sLlxuICpcbiAqIDMuIE9SVCBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyBhZnRlciBzdGVwIDIuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIHBlcmZvcm1zIE9OTlggUnVudGltZSBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cbiAqIEZ1bmN0aW9uIGBfT3J0SW5pdCgpYCBpcyBjYWxsZWQgaW4gdGhpcyBzdGVwLlxuICogICAgIC0gaWYgcHJveHkgaXMgZW5hYmxlZCwgdGhpcyBzdGVwIGhhcHBlbnMgaW4gdGhlIHByb3h5IHdvcmtlciB1c2luZyBtZXNzYWdlICdpbml0LW9ydCcuXG4gKiAgICAgLSBsb2dnaW5nIGxldmVsIChvcnQuZW52LmxvZ0xldmVsKSBhbmQgdGhyZWFkIG51bWJlciAob3J0LmVudi53YXNtLm51bVRocmVhZHMpIGFyZSBzZXQgaW4gdGhpcyBzdGVwLlxuICpcbiAqIDQuIFNlc3Npb24gaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yIGBvcnQuVHJhaW5pbmdTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQuIFVubGlrZSB0aGUgZmlyc3QgM1xuICogc3RlcHMgKHRoZXkgb25seSBjYWxsZWQgb25jZSksIHRoaXMgc3RlcCB3aWxsIGJlIGRvbmUgZm9yIGVhY2ggc2Vzc2lvbi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGVcbiAqIGZvbGxvd2luZ3M6XG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVVJMOlxuICogICAgLSBkb3dubG9hZCB0aGUgbW9kZWwgZGF0YSBmcm9tIHRoZSBVUkwuXG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gZGVyZWZlcmVuY2UgdGhlIG1vZGVsIGJ1ZmZlci4gVGhpcyBzdGVwIGFsbG93cyB0aGUgb3JpZ2luYWwgQXJyYXlCdWZmZXIgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcbiAqXG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVWludDhBcnJheSBvYmplY3Q6XG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqXG4gKi9cblxuLyoqXG4gKiBpbml0aWFsaXplIE9SVCBlbnZpcm9ubWVudC5cbiAqXG4gKiBAcGFyYW0gbnVtVGhyZWFkcyBTZXRHbG9iYWxJbnRyYU9wTnVtVGhyZWFkcyhudW1UaHJlYWRzKVxuICogQHBhcmFtIGxvZ2dpbmdMZXZlbCBDcmVhdGVFbnYoc3RhdGljX2Nhc3Q8T3J0TG9nZ2luZ0xldmVsPihsb2dnaW5nX2xldmVsKSlcbiAqL1xuY29uc3QgaW5pdE9ydCA9IChudW1UaHJlYWRzOiBudW1iZXIsIGxvZ2dpbmdMZXZlbDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVycm9yQ29kZSA9IGdldEluc3RhbmNlKCkuX09ydEluaXQobnVtVGhyZWFkcywgbG9nZ2luZ0xldmVsKTtcbiAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGluaXRpYWxpemUgb25ueHJ1bnRpbWUuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogaW50aWFsaXplIHJ1bnRpbWUgZW52aXJvbm1lbnQuXG4gKiBAcGFyYW0gZW52IHBhc3NlZCBpbiB0aGUgZW52aXJvbm1lbnQgY29uZmlnIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRSdW50aW1lID0gYXN5bmMoZW52OiBFbnYpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgLy8gaW5pdCBPUlRcbiAgaW5pdE9ydChlbnYud2FzbS5udW1UaHJlYWRzISwgbG9nTGV2ZWxTdHJpbmdUb0VudW0oZW52LmxvZ0xldmVsKSk7XG59O1xuXG4vKipcbiAqIHBlcmZvcm0gRVAgc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24uXG4gKlxuICogQHBhcmFtIGVudlxuICogQHBhcmFtIGVwTmFtZVxuICovXG5leHBvcnQgY29uc3QgaW5pdEVwID0gYXN5bmMoZW52OiBFbnYsIGVwTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiAoZXBOYW1lID09PSAnd2ViZ3B1JyB8fCBlcE5hbWUgPT09ICd3ZWJubicpKSB7XG4gICAgLy8gcGVyZm9ybSBXZWJHUFUgYXZhaWxhYmlsaXR5IGNoZWNrXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnIHx8ICFuYXZpZ2F0b3IuZ3B1KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gICAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnRmFpbGVkIHRvIGdldCBHUFUgYWRhcHRlci4gWW91IG1heSBuZWVkIHRvIGVuYWJsZSBmbGFnIFwiLS1lbmFibGUtdW5zYWZlLXdlYmdwdVwiIGlmIHlvdSBhcmUgdXNpbmcgQ2hyb21lLicpO1xuICAgIH1cblxuICAgIGlmICghZW52Lndhc20uc2ltZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdOb3Qgc3VwcG9ydGVkIGZvciBXZWJHUFU9T04gYW5kIFNJTUQ9T0ZGLiBQbGVhc2Ugc2V0IGBlbnYud2FzbS5zaW1kYCB0byB0cnVlIHdoZW4gdXNpbmcgYHdlYmdwdWAgRVAnKTtcbiAgICB9XG5cbiAgICAvLyBpbml0IEpTRVAgaWYgYXZhaWxhYmxlXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xuICAgIGF3YWl0IGluaXRKc2VwKGdldEluc3RhbmNlKCksIGVudiwgYWRhcHRlcik7XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbFxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG4vKipcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxuICogQHBhcmFtIHNlc3Npb25IYW5kbGUgdGhlIGhhbmRsZSByZXByZXNlbnRpbmcgdGhlIHNlc3Npb24uIHNob3VsZCBiZSBub24temVyby5cbiAqIEByZXR1cm5zIGEgdHVwbGUgaW5jbHVkaW5nIDIgbnVtYmVycywgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCBjb3VudCBhbmQgb3V0cHV0IGNvdW50LlxuICovXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudCA9IChzZXNzaW9uSGFuZGxlOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIDQpO1xuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBjb3VudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIFt3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNF0sIHdhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0ICsgMV1dO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIGV4dGVybmFsIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWwgLSB0aGUgZXh0ZXJuYWwgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuIE11c3Qgbm90IGJlIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLlxuICogQHJldHVybnMgYSAyLWVsZW1lbnRzIHR1cGxlIC0gdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIGZyb20gYSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWxEYXRhIC0gZWl0aGVyIGEgVWludDhBcnJheSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCBkYXRhLCBvciBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGVcbiAqICAgICBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gYXN5bmMoXG4gICAgbW9kZWxEYXRhOiBVaW50OEFycmF5fFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLFxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcbiAgbGV0IG1vZGVsRGF0YU9mZnNldDogbnVtYmVyLCBtb2RlbERhdGFMZW5ndGg6IG51bWJlcjtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxEYXRhKSkge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgaXMgYW4gYXJyYXksIGl0IG11c3QgYmUgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGFcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gbW9kZWxEYXRhO1xuICB9IGVsc2UgaWYgKG1vZGVsRGF0YS5idWZmZXIgPT09IHdhc20uSEVBUFU4LmJ1ZmZlcikge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgdXNlcyB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcCwgd2UgZG9uJ3QgbmVlZCB0byBjb3B5IGl0LlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBbbW9kZWxEYXRhLmJ5dGVPZmZzZXQsIG1vZGVsRGF0YS5ieXRlTGVuZ3RoXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBvdGhlcndpc2UsIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC5cbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihtb2RlbERhdGEpO1xuICB9XG5cbiAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gW107XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICB0cnkge1xuICAgIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXSA9IHNldFNlc3Npb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnM/LmV4dGVybmFsRGF0YSAmJiB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhKSB7XG4gICAgICBjb25zdCBsb2FkaW5nUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLmV4dGVybmFsRGF0YSkge1xuICAgICAgICBjb25zdCBwYXRoID0gdHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUucGF0aDtcbiAgICAgICAgbG9hZGluZ1Byb21pc2VzLnB1c2gobG9hZEZpbGUodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUuZGF0YSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhIShwYXRoLCBkYXRhKTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICAvLyB3YWl0IGZvciBhbGwgZXh0ZXJuYWwgZGF0YSBmaWxlcyB0byBiZSBsb2FkZWRcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGxvYWRpbmdQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgc2Vzc2lvbkhhbmRsZSA9IGF3YWl0IHdhc20uX09ydENyZWF0ZVNlc3Npb24obW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGgsIHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIGEgc2Vzc2lvbi4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICBjb25zdCBpbnB1dE5hbWVzID0gW107XG4gICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBbXTtcbiAgICBjb25zdCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldElucHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBpbnB1dCBuYW1lLicpO1xuICAgICAgfVxuICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICBpbnB1dE5hbWVzLnB1c2god2FzbS5VVEY4VG9TdHJpbmcobmFtZSkpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRPdXRwdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIG91dHB1dCBuYW1lLicpO1xuICAgICAgfVxuICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgY29uc3QgbmFtZVN0cmluZyA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpO1xuICAgICAgb3V0cHV0TmFtZXMucHVzaChuYW1lU3RyaW5nKTtcblxuICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uIDpcbiAgICAgICAgICAgIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uPy5bbmFtZVN0cmluZ10gPz8gJ2NwdSc7XG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkIHByZWZlcnJlZCBvdXRwdXQgbG9jYXRpb246ICR7bG9jYXRpb259LmApO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgIGxldCBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwgPSBudWxsO1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcbiAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xuICAgICAgfVxuXG4gICAgICBiaW5kaW5nU3RhdGUgPSB7XG4gICAgICAgIGhhbmRsZTogaW9CaW5kaW5nSGFuZGxlLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5tYXAobCA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbkhhbmRsZSwgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgYmluZGluZ1N0YXRlXSk7XG4gICAgcmV0dXJuIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzLCBvdXRwdXROYW1lc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG5cbiAgICBpZiAoaW9CaW5kaW5nSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdIYW5kbGUpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLl9mcmVlKG1vZGVsRGF0YU9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG5cbiAgICAvLyB1bm1vdW50IGV4dGVybmFsIGRhdGEgaWYgbmVjZXNzYXJ5XG4gICAgd2FzbS51bm1vdW50RXh0ZXJuYWxEYXRhPy4oKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbGVhc2VTZXNzaW9uID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJlbGVhc2Ugc2Vzc2lvbi4gaW52YWxpZCBzZXNzaW9uIGlkOiAke3Nlc3Npb25JZH1gKTtcbiAgfVxuICBjb25zdCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBVbnJlZ2lzdGVyQnVmZmVycz8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTpcbiAgICAgICAgdm9pZCA9PiB7XG4gICAgICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG5cbiAgICAgICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICAgICAgaWYgKGRhdGFUeXBlID09PSAnc3RyaW5nJyAmJiBsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG4gICAgICAgICAgICByYXdEYXRhID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSA0ICogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICAgICAgbGV0IGRhdGFJbmRleCA9IHJhd0RhdGEgLyA0O1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZW5zb3IgZGF0YSBhdCBpbmRleCAke2l9IGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcbiAgICAgICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcbiAgICAgICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoaW5wdXRUZW5zb3JzW2ldLCBpbnB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0SW5kaWNlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBpbnB1dE5hbWVzSW5kZXggPSBpbnB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0VmFsdWVzSW5kZXggPSBvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXRWYWx1ZXNJbmRleCsrXSA9IGlucHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dE5hbWVzSW5kZXgrK10gPSBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgY29uc3Qge2hhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7XG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPVxuICAgICAgICAgICAgICB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIDAsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWRbaW5kZXhdKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG4vL1xuLy8gKiB0eXBlIGhhY2sgZm9yIFwiSFRNTEltYWdlRWxlbWVudFwiXG4vL1xuLy8gaW4gdHlwZXNjcmlwdCwgdGhlIHR5cGUgb2YgXCJIVE1MSW1hZ2VFbGVtZW50XCIgaXMgZGVmaW5lZCBpbiBsaWIuZG9tLmQudHMsIHdoaWNoIGlzIGNvbmZsaWN0IHdpdGggbGliLndlYndvcmtlci5kLnRzLlxuLy8gd2hlbiB3ZSB1c2Ugd2Vid29ya2VyLCB0aGUgbGliLndlYndvcmtlci5kLnRzIHdpbGwgYmUgdXNlZCwgd2hpY2ggZG9lcyBub3QgaGF2ZSBIVE1MSW1hZ2VFbGVtZW50IGRlZmluZWQuXG4vL1xuLy8gd2Ugd2lsbCBnZXQgdGhlIGZvbGxvd2luZyBlcnJvcnMgY29tcGxhaW5pbmcgdGhhdCBIVE1MSW1hZ2VFbGVtZW50IGlzIG5vdCBkZWZpbmVkOlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gLi4vY29tbW9uL2Rpc3QvY2pzL3RlbnNvci1mYWN0b3J5LmQudHM6MTg3OjI5IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gMTg3ICAgICBmcm9tSW1hZ2UoaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50LCBvcHRpb25zPzogVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMpOlxuLy8gUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gbm9kZV9tb2R1bGVzL0B3ZWJncHUvdHlwZXMvZGlzdC9pbmRleC5kLnRzOjgzOjcgLSBlcnJvciBUUzI1NTI6IENhbm5vdCBmaW5kIG5hbWUgJ0hUTUxJbWFnZUVsZW1lbnQnLiBEaWQgeW91IG1lYW5cbi8vICdIVE1MTElFbGVtZW50Jz9cbi8vXG4vLyA4MyAgICAgfCBIVE1MSW1hZ2VFbGVtZW50XG4vLyAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyBgSFRNTEltYWdlRWxlbWVudGAgaXMgb25seSB1c2VkIGluIHR5cGUgZGVjbGFyYXRpb24gYW5kIG5vdCBpbiByZWFsIGNvZGUuIFNvIHdlIGRlZmluZSBpdCBhcyBgdW5rbm93bmAgaGVyZSB0b1xuLy8gYnlwYXNzIHRoZSB0eXBlIGNoZWNrLlxuLy9cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdHlwZSBIVE1MSW1hZ2VFbGVtZW50ID0gdW5rbm93bjtcbn1cblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGF9IGZyb20gJy4uL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7Y3JlYXRlU2Vzc2lvbiwgY29weUZyb21FeHRlcm5hbEJ1ZmZlciwgZW5kUHJvZmlsaW5nLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycywgaW5pdEVwLCBpbml0UnVudGltZSwgcmVsZWFzZVNlc3Npb24sIHJ1bn0gZnJvbSAnLi4vd2FzbS1jb3JlLWltcGwnO1xuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4uL3dhc20tZmFjdG9yeSc7XG5cbnNlbGYub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIGNvbnN0IHt0eXBlLCBpbiA6IG1lc3NhZ2V9ID0gZXYuZGF0YTtcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2luaXQtd2FzbSc6XG4gICAgICAgIGluaXRpYWxpemVXZWJBc3NlbWJseShtZXNzYWdlIS53YXNtKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaW5pdFJ1bnRpbWUobWVzc2FnZSEpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2luaXQtZXAnOiB7XG4gICAgICAgIGNvbnN0IHtlcE5hbWUsIGVudn0gPSBtZXNzYWdlITtcbiAgICAgICAgaW5pdEVwKGVudiwgZXBOYW1lKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY29weS1mcm9tJzoge1xuICAgICAgICBjb25zdCB7YnVmZmVyfSA9IG1lc3NhZ2UhO1xuICAgICAgICBjb25zdCBidWZmZXJEYXRhID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihidWZmZXIpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgb3V0OiBidWZmZXJEYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY3JlYXRlJzoge1xuICAgICAgICBjb25zdCB7bW9kZWwsIG9wdGlvbnN9ID0gbWVzc2FnZSE7XG4gICAgICAgIGNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBzZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgICAgICByZWxlYXNlU2Vzc2lvbihtZXNzYWdlISk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncnVuJzoge1xuICAgICAgICBjb25zdCB7c2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9uc30gPSBtZXNzYWdlITtcbiAgICAgICAgcnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG5ldyBBcnJheShvdXRwdXRJbmRpY2VzLmxlbmd0aCkuZmlsbChudWxsKSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIG91dHB1dHMgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dHMuc29tZShvID0+IG9bM10gIT09ICdjcHUnKSkge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyOiAnUHJveHkgZG9lcyBub3Qgc3VwcG9ydCBub24tY3B1IHRlbnNvciBsb2NhdGlvbi4nfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlLCBvdXQ6IG91dHB1dHN9IGFzIE9ydFdhc21NZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMob3V0cHV0cyBhcyBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOlxuICAgICAgICBlbmRQcm9maWxpbmcobWVzc2FnZSEpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZX0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQWEsVUFBa0MsY0FBc0M7QUFBckY7QUFBQTtBQUFPLE1BQU0sV0FBVztBQUFpQixNQUFNLGVBQWU7QUFBaUIsTUFBTSxtQkFBbUI7QUFBQTtBQUFBOzs7QUNBeEc7QUFBQTtBQUFBLGdCQUFBQTtBQUFBO0FBQUEsTUFBYUE7QUFBYjtBQUFBO0FBQU8sTUFBTUEsUUFBTztBQUFBO0FBQUE7OztBQ0FwQjtBQUFBO0FBQUE7QUFDQSxVQUFJLFdBQVcsTUFBTTtBQUNuQixZQUFJLGFBQWEsT0FBTyxhQUFhLGVBQWUsU0FBUyxnQkFBZ0IsU0FBUyxjQUFjLE1BQU07QUFDMUcsWUFBSSxPQUFPLGVBQWU7QUFBYSx1QkFBYSxjQUFjO0FBQ2xFLGVBQ0YsU0FBUyxZQUFZLENBQUMsR0FBRztBQUV6QixjQUFJLElBQUUsV0FBVSxHQUFFO0FBQUUsWUFBRSxRQUFNLElBQUksUUFBUSxDQUFDLEdBQUUsTUFBSTtBQUFDLGdCQUFFO0FBQUUsZ0JBQUU7QUFB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QUFBLGNBQUMsQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUUsSUFBRSxFQUFFLFlBQVksSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFBLFlBQUM7QUFBQyxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDO0FBQUUsZ0JBQUUsRUFBQyxJQUFHLEVBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLElBQUUsRUFBRSxDQUFDLElBQUUsR0FBRTtBQUFFLGdCQUFFLEVBQUUsQ0FBQztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLO0FBQUEsY0FBdUIsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQUssTUFBSztBQUFBLGNBQWMsTUFBSztBQUFBLGNBQVEsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQzdlLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxZQUFJO0FBQUUscUJBQVEsS0FBSztBQUFFLGtCQUFFLEVBQUUsUUFBUSxJQUFJLE9BQU8sR0FBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLENBQUM7QUFBRSxnQkFBSSxLQUFHLDJEQUEyRCxNQUFNLEdBQUcsR0FBRSxLQUFHLHdGQUF3RixNQUFNLEdBQUc7QUFBRSxnQkFBRTtBQUFBLGNBQUMsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRTtBQUFBLGNBQ3RmLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUU7QUFBQSxjQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsS0FBRyxRQUFNLE1BQUksR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUc7QUFBQyxvQkFBRSxFQUFFO0FBQUcscUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSx1QkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLGNBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLHlCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBRyxFQUFFLEtBQUcsR0FBRSxNQUFJLEVBQUUsRUFBRSxLQUFHLElBQUksSUFBRSxLQUFHLElBQUksR0FBRztBQUFFO0FBQUMsdUJBQU8sRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssTUFBSTtBQUFBLGNBQUssTUFBSyxPQUFHLEtBQUcsRUFBRSxNQUFJLEtBQUcsRUFBRSxLQUFHLE9BQUs7QUFBQSxjQUFLLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE1BQUk7QUFBQSxjQUFLLE1BQUssT0FBRyxFQUFFLE1BQUk7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFBLGdCQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsSUFBRSxFQUFFLE1BQUksQ0FBQztBQUFBLGdCQUNuZjtBQUFBLGNBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLHNCQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxLQUFHLEtBQUc7QUFBSSxvQkFBRztBQUFFLHdCQUFJLE1BQUksS0FBRyxFQUFFLEtBQUcsTUFBSSxFQUFFLE1BQUksR0FBRSxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxFQUFFLE1BQUksSUFBRTtBQUFBLHFCQUFRO0FBQUMsc0JBQUU7QUFBRyxzQkFBSSxLQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUUsbUJBQUMsS0FBRyxLQUFHLEtBQUcsS0FBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsTUFBSTtBQUFBLGdCQUFHO0FBQUMsdUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssUUFBSSxFQUFFLEtBQUcsTUFBTSxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFHO0FBQUEsY0FBSyxNQUFLLE9BQUc7QUFBQyxvQkFBRSxFQUFFO0FBQUcsb0JBQUksSUFBRSxLQUFHO0FBQUUsb0JBQUUsS0FBSyxJQUFJLENBQUMsSUFBRTtBQUFHLHdCQUFPLElBQUUsTUFBSSxPQUFLLE9BQU8sVUFBUSxJQUFFLEtBQUcsTUFBSSxJQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxNQUFJO0FBQUEsWUFBRztBQUFFLGdCQUFFLEVBQUUsUUFBUSxPQUFNLE1BQVU7QUFDeGYsaUJBQUksS0FBSztBQUFFLGdCQUFFLFNBQVMsQ0FBQyxNQUFJLElBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBRyxnQkFBRSxFQUFFLFFBQVEsU0FBUSxHQUFHO0FBQUUsZ0JBQUUsR0FBRyxDQUFDO0FBQUUsZ0JBQUcsRUFBRSxTQUFPO0FBQUUscUJBQU87QUFBRSxjQUFFLElBQUksR0FBRSxNQUFJLENBQUM7QUFBRSxtQkFBTyxFQUFFLFNBQU87QUFBQSxVQUFDO0FBQzNKLGNBQUksS0FBRyxFQUFDLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFLO0FBQUUsWUFBQyxJQUFJLEdBQUcsQ0FBQyxFQUFHLEdBQUcsTUFBSSxHQUFFLE1BQUksQ0FBQztBQUFFLGlCQUFHO0FBQUU7QUFBSyxrQkFBTTtBQUFBLFVBQUcsR0FBRSxHQUFFLFdBQVU7QUFBQyxtQkFBTztBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQyxtQkFBTztBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsTUFBSSxHQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFFLElBQUUsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLG1CQUFLO0FBQUUsZ0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGNBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxjQUFFLElBQUUsT0FDaGYsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsY0FBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxZQUFZO0FBQUUsY0FBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxlQUFlLElBQUU7QUFBSyxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFVBQVU7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsS0FBRyxFQUFFLFFBQVEsSUFBRSxLQUFLLElBQUksRUFBRSxlQUFlLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsS0FBRyxRQUFNO0FBQUEsVUFBQyxHQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFFLElBQUUsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLG1CQUFLO0FBQUUsZ0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGNBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFLLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUN6ZixjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsS0FBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsS0FBRyxFQUFFLGtCQUFrQjtBQUFHLGdCQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxnQkFBSSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsS0FBRyxLQUFHLEtBQUcsRUFBRSxrQkFBa0IsS0FBRyxLQUFLLElBQUksR0FBRSxDQUFDLEtBQUc7QUFBQSxVQUFDLEdBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxtQkFBSztBQUFFLGdCQUFJLElBQUUsSUFBSSxLQUFLLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLE1BQUssRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLENBQUMsR0FBRSxJQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FDMWdCLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQixHQUFFLElBQUUsS0FBSyxJQUFJLEdBQUUsQ0FBQztBQUFFLGdCQUFFLElBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsT0FBTyxLQUFHLEtBQUcsS0FBRyxDQUFDLElBQUUsSUFBRSxNQUFJLEtBQUcsT0FBSyxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUMsR0FBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLElBQUUsUUFBTSxJQUFFLElBQUUsSUFBRSxLQUFHLEVBQUU7QUFBRyxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLE9BQU87QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsS0FBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGNBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJ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RTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM3ZCxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxjQUFJ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QyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsR0FBRztBQUFFLGNBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUU7QUFBTyxnQkFBSSxJQUFFO0FBQUUsY0FBRSxRQUFRLE9BQUcsS0FBRyxFQUFFLFNBQU8sQ0FBQztBQUFFLGNBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLElBQUcsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQ3BjLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLGNBQUksS0FBRyxDQUFDLE1BQUssQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLHFCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUk7QUFBQyxrQkFBSSxJQUFFLEVBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUM7QUFBRSxtQkFBRztBQUFFLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLG9CQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxDQUFDLEdBQUUsSUFBRSxHQUFHLENBQUM7QUFBRSxzQkFBSSxLQUFHLE9BQUssTUFBSSxNQUFJLElBQUUsS0FBRyxHQUFHLEdBQUcsR0FBRSxDQUFDLENBQUMsR0FBRSxFQUFFLFNBQU8sS0FBRyxFQUFFLEtBQUssQ0FBQztBQUFBLGNBQUM7QUFBQyxtQkFBRztBQUFBLFlBQUM7QUFBQyxjQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLGNBQUksS0FBRyxDQUFDLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxFQUFFLEdBQUUsS0FBRyxDQUFDLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxFQUFFO0FBQUUsbUJBQVMsR0FBRyxHQUFFO0FBQUMsZ0JBQUksSUFBRSxNQUFNLEdBQUcsQ0FBQyxJQUFFLENBQUM7QUFBRSxlQUFHLEdBQUUsR0FBRSxHQUFFLEVBQUUsTUFBTTtBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUNoZixjQUFJLEtBQUcsQ0FBQyxHQUFFLE1BQUk7QUFBQyxjQUFFLEVBQUUsSUFBSSxHQUFFLE1BQUksQ0FBQztBQUFBLFVBQUM7QUFDL0IsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQVMsRUFBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFJLElBQUUsWUFBVSxPQUFPLElBQUUsRUFBRSxTQUFTLElBQUUsS0FBRyxJQUFHLEVBQUUsU0FBTztBQUFHLG9CQUFFLEVBQUUsQ0FBQyxJQUFFO0FBQUUscUJBQU87QUFBQSxZQUFDO0FBQUMscUJBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFHO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRSxHQUFFO0FBQUMsdUJBQVMsRUFBRSxJQUFHO0FBQUMsdUJBQU8sSUFBRSxLQUFHLEtBQUcsSUFBRSxLQUFHLElBQUU7QUFBQSxjQUFDO0FBQUMsa0JBQUk7QUFBRSxxQkFBSyxJQUFFLEVBQUUsRUFBRSxZQUFZLElBQUUsRUFBRSxZQUFZLENBQUMsTUFBSSxPQUFLLElBQUUsRUFBRSxFQUFFLFNBQVMsSUFBRSxFQUFFLFNBQVMsQ0FBQyxPQUFLLElBQUUsRUFBRSxFQUFFLFFBQVEsSUFBRSxFQUFFLFFBQVEsQ0FBQztBQUFHLHFCQUFPO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRTtBQUFDLHNCQUFPLEVBQUUsT0FBTyxHQUFFO0FBQUEsZ0JBQUMsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLElBQUcsRUFBRTtBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTztBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUk7QUFBQSxvQkFBSyxFQUFFLFlBQVk7QUFBQSxvQkFDNWY7QUFBQSxvQkFBRTtBQUFBLGtCQUFDO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUM7QUFBQSxnQkFBRSxLQUFLO0FBQUUseUJBQU8sSUFBSSxLQUFLLEVBQUUsWUFBWSxJQUFFLEdBQUUsSUFBRyxFQUFFO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLElBQUcsRUFBRTtBQUFBLGNBQUM7QUFBQSxZQUFDO0FBQUMscUJBQVMsRUFBRSxHQUFFO0FBQUMsa0JBQUksSUFBRSxFQUFFO0FBQUcsbUJBQUksSUFBRSxJQUFJLEtBQU0sSUFBSSxLQUFLLEVBQUUsS0FBRyxNQUFLLEdBQUUsQ0FBQyxFQUFHLFFBQVEsQ0FBQyxHQUFFLElBQUUsS0FBRztBQUFDLG9CQUFJLElBQUUsRUFBRSxTQUFTLEdBQUUsS0FBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLENBQUM7QUFBRSxvQkFBRyxJQUFFLElBQUUsRUFBRSxRQUFRO0FBQUUsdUJBQUcsSUFBRSxFQUFFLFFBQVEsSUFBRSxHQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUUsS0FBRyxJQUFFLEVBQUUsU0FBUyxJQUFFLENBQUMsS0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFFLEVBQUUsWUFBWSxFQUFFLFlBQVksSUFBRSxDQUFDO0FBQUEscUJBQU87QUFBQyxvQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFFLENBQUM7QUFBRTtBQUFBLGdCQUFLO0FBQUEsY0FBQztBQUFDLGtCQUFFLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLGtCQUFFLEVBQUUsSUFBSTtBQUFBLGdCQUFLLEVBQUUsWUFBWTtBQUFBLGdCQUNuZjtBQUFBLGdCQUFFO0FBQUEsY0FBQyxDQUFDO0FBQUUsa0JBQUUsRUFBRSxDQUFDO0FBQUUscUJBQU8sS0FBRyxFQUFFLEdBQUUsQ0FBQyxJQUFFLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRSxJQUFFLEVBQUUsWUFBWSxJQUFFLEVBQUUsWUFBWSxJQUFFO0FBQUEsWUFBQztBQUFDLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEVBQUMsSUFBRyxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLElBQUUsRUFBRSxDQUFDLElBQUUsR0FBRTtBQUFFLGdCQUFFLEVBQUUsQ0FBQztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLO0FBQUEsY0FBdUIsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQUssTUFBSztBQUFBLGNBQWMsTUFBSztBQUFBLGNBQVEsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQ25mLE1BQUs7QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxZQUFJO0FBQUUscUJBQVEsS0FBSztBQUFFLGtCQUFFLEVBQUUsUUFBUSxJQUFJLE9BQU8sR0FBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLENBQUM7QUFBRSxnQkFBSSxJQUFFLDJEQUEyRCxNQUFNLEdBQUcsR0FBRSxJQUFFLHdGQUF3RixNQUFNLEdBQUc7QUFBRSxnQkFBRSxFQUFDLE1BQUssT0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUN6ZixFQUFFLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUcsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRztBQUFDLGtCQUFFLEVBQUU7QUFBRyxtQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHFCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRztBQUFDLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBRyxFQUFFLEtBQUcsR0FBRSxNQUFJLEVBQUUsRUFBRSxLQUFHLElBQUksSUFBRSxLQUFHLElBQUksR0FBRztBQUFFO0FBQUMscUJBQU8sRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssTUFBSSxNQUFLLE1BQUssT0FBRyxLQUFHLEVBQUUsTUFBSSxLQUFHLEVBQUUsS0FBRyxPQUFLLE1BQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksS0FBSyxNQUFLLE9BQUcsRUFBRSxNQUFJLEdBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxJQUFFLEVBQUUsTUFDcGYsQ0FBQyxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBSSxJQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsS0FBRyxFQUFFLEtB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LENBQUMsR0FBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsa0JBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLE9BQU8sS0FBRyxLQUFHLEtBQUcsQ0FBQyxJQUFFLElBQUUsTUFBSSxLQUFHLE9BQUssSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDLEdBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFFLFFBQU0sSUFBRSxJQUFFLElBQUUsS0FBRyxFQUFFO0FBQUcsZ0JBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxPQUFPO0FBQUUsbUJBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxJQUNuZ0IsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFO0FBQUUsZ0JBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGdCQUFFLEVB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QUk7QUFDbEUsY0FBSSxXQUFXLGNBQWMsUUFBUSxlQUFlLElBQUksTUFBTSxjQUFjLE1BQU0sRUFBRSxLQUFLLElBQUksR0FBRyxPQUFPLEVBQ2xHO0FBQUEsWUFDRyxhQUFXO0FBQ1Qsa0JBQUksUUFBUSxLQUFLLE9BQUssRUFBRSxDQUFDLE1BQU0sS0FBSyxHQUFHO0FBQ3JDLDRCQUFZLEVBQUMsTUFBTSxLQUFLLGtEQUFpRCxDQUFDO0FBQUEsY0FDNUUsT0FBTztBQUNMO0FBQUEsa0JBQ0ksRUFBQyxNQUFNLEtBQUssUUFBTztBQUFBLGtCQUNuQiwyQkFBMkIsT0FBdUM7QUFBQSxnQkFBQztBQUFBLGNBQ3pFO0FBQUEsWUFDRjtBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxJQUFHLENBQUM7QUFBQSxZQUN6QjtBQUFBLFVBQUM7QUFDVDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUs7QUFDSCx1QkFBYSxPQUFRO0FBQ3JCLHNCQUFZLEVBQUMsS0FBSSxDQUFDO0FBQ2xCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLGtCQUFZLEVBQUMsTUFBTSxJQUFHLENBQW1CO0FBQUEsSUFDM0M7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJqb2luIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInJlYWRGaWxlIiwgInJlYWRGaWxlIiwgIndhc20iLCAidGVuc29yIiwgImVycm9yQ29kZSIsICJpIl0KfQo=\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, queuedCallbacks, enqueueCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    isProxy = () => !!env2.wasm.proxy && typeof document !== "undefined";
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    queuedCallbacks = /* @__PURE__ */ new Map();
    enqueueCallbacks = (type, callbacks) => {
      const queue = queuedCallbacks.get(type);
      if (queue) {
        queue.push(callbacks);
      } else {
        queuedCallbacks.set(type, [callbacks]);
      }
    };
    ensureWorker = () => {
      if (initializing2 || !initialized2 || aborted2 || !proxyWorker) {
        throw new Error("worker not ready");
      }
    };
    onProxyWorkerMessage = (ev) => {
      switch (ev.data.type) {
        case "init-wasm":
          initializing2 = false;
          if (ev.data.err) {
            aborted2 = true;
            initWasmCallbacks[1](ev.data.err);
          } else {
            initialized2 = true;
            initWasmCallbacks[0]();
          }
          break;
        case "init-ep":
        case "copy-from":
        case "create":
        case "release":
        case "run":
        case "end-profiling": {
          const callbacks = queuedCallbacks.get(ev.data.type);
          if (ev.data.err) {
            callbacks.shift()[1](ev.data.err);
          } else {
            callbacks.shift()[0](ev.data.out);
          }
          break;
        }
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyAndOrtRuntime = async () => {
      if (initialized2) {
        return;
      }
      if (initializing2) {
        throw new Error("multiple calls to 'initWasm()' detected.");
      }
      if (aborted2) {
        throw new Error("previous call to 'initWasm()' failed.");
      }
      initializing2 = true;
      if (isProxy()) {
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require_main()
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2 };
          proxyWorker.postMessage(message);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e) {
          aborted2 = true;
          throw e;
        } finally {
          initializing2 = false;
        }
      }
    };
    initializeOrtEp = async (epName) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("init-ep", [resolve, reject]);
          const message = { type: "init-ep", in: { epName, env: env2 } };
          proxyWorker.postMessage(message);
        });
      } else {
        await initEp(env2, epName);
      }
    };
    copyFromExternalBuffer2 = async (buffer) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("copy-from", [resolve, reject]);
          const message = { type: "copy-from", in: { buffer } };
          proxyWorker.postMessage(message, [buffer.buffer]);
        });
      } else {
        return copyFromExternalBuffer(buffer);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("create", [resolve, reject]);
          const message = { type: "create", in: { model, options } };
          const transferable = [];
          if (model instanceof Uint8Array) {
            transferable.push(model.buffer);
          }
          proxyWorker.postMessage(message, transferable);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("release", [resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (isProxy()) {
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("run", [resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("end-profiling", [resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
  }
});

// web/lib/wasm/session-handler-inference.ts
var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    init_wasm_utils_load_file();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async fetchModelAndCopyToWasmMemory(path) {
        return copyFromExternalBuffer2(await loadFile(path));
      }
      async loadModel(pathOrBuffer, options) {
        TRACE_FUNC_BEGIN();
        let model;
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
        TRACE_FUNC_END();
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        TRACE_FUNC_BEGIN();
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        TRACE_FUNC_END();
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      /**
       * This function initializes the WebAssembly backend.
       *
       * This function will be called only once for each backend name. It will be called the first time when
       * `ort.InferenceSession.create()` is called with a registered backend name.
       *
       * @param backendName - the registered backend name.
       */
      async init(backendName) {
        initializeFlags();
        await initializeWebAssemblyAndOrtRuntime();
        await initializeOrtEp(backendName);
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/wasm/wasm-training-core-impl.ts
var NO_TRAIN_FUNCS_MSG, ifErrCodeCheckLastError, createCheckpointHandle, getModelInputOutputCount, getModelInputOutputNamesLoop, getModelInputOutputNames, createTrainingSessionHandle, createAndAllocateTensors, moveOutputToTensorMetadataArr, lazyResetGrad, runTrainStep, runOptimizerStep, runEvalStep, getParametersSize, getContiguousParameters, loadParametersBuffer, releaseTrainingSessionAndCheckpoint;
var init_wasm_training_core_impl = __esm({
  "web/lib/wasm/wasm-training-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils();
    NO_TRAIN_FUNCS_MSG = "Built without training API's enabled. Use the onnxruntime-web/training import for training functionality, and make sure that all the correct artifacts are built & moved to the correct folder if using a custom build. Check https://onnxruntime.ai/docs/build/web.html for more information.";
    ifErrCodeCheckLastError = (errCode, message, checkNeqZero = true) => {
      if (checkNeqZero && errCode !== 0) {
        checkLastError(message);
      } else if (!checkNeqZero && errCode === 0) {
        checkLastError(message);
      }
    };
    createCheckpointHandle = (checkpointData) => {
      const wasm2 = getInstance();
      const [checkpointDataOffset, checkpointDataLength] = checkpointData;
      let checkpointHandle = 0;
      try {
        if (wasm2._OrtTrainingLoadCheckpoint) {
          checkpointHandle = wasm2._OrtTrainingLoadCheckpoint(checkpointDataOffset, checkpointDataLength);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(checkpointHandle, "Error occurred when trying to create a CheckpointState", false);
        return checkpointHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseCheckpoint && checkpointHandle !== 0) {
          wasm2._OrtTrainingReleaseCheckpoint(checkpointHandle);
        }
        throw e;
      } finally {
        wasm2._OrtFree(checkpointData[0]);
      }
    };
    getModelInputOutputCount = (trainingSessionId, isEvalModel) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        if (wasm2._OrtTrainingGetModelInputOutputCount) {
          const errorCode = wasm2._OrtTrainingGetModelInputOutputCount(trainingSessionId, dataOffset, dataOffset + 4, isEvalModel);
          ifErrCodeCheckLastError(errorCode, "Can't get session input/output count.");
          return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getModelInputOutputNamesLoop = (trainingSessionId, count, isInput, isEvalModel) => {
      const names = [];
      const wasm2 = getInstance();
      for (let i = 0; i < count; i++) {
        if (wasm2._OrtTrainingGetModelInputOutputName) {
          const name = wasm2._OrtTrainingGetModelInputOutputName(trainingSessionId, i, isInput, isEvalModel);
          ifErrCodeCheckLastError(name, `Can't get input or output name -- is input: ${isInput}, index ${i}`, false);
          names.push(wasm2.UTF8ToString(name));
          wasm2._free(name);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      }
      return names;
    };
    getModelInputOutputNames = (trainingSessionId, isEvalModel) => {
      let inputNames = [];
      let outputNames = [];
      const [inputCount, outputCount] = getModelInputOutputCount(trainingSessionId, isEvalModel);
      inputNames = getModelInputOutputNamesLoop(trainingSessionId, inputCount, true, isEvalModel);
      outputNames = getModelInputOutputNamesLoop(trainingSessionId, outputCount, false, isEvalModel);
      return [inputNames, outputNames];
    };
    createTrainingSessionHandle = (checkpointHandle, trainModelData, evalModelData, optimizerModelData, options) => {
      const wasm2 = getInstance();
      let trainingSessionHandle = 0;
      let sessionOptionsHandle = 0;
      let allocs = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (wasm2._OrtTrainingCreateSession) {
          trainingSessionHandle = wasm2._OrtTrainingCreateSession(
            sessionOptionsHandle,
            checkpointHandle,
            trainModelData[0],
            trainModelData[1],
            evalModelData[0],
            evalModelData[1],
            optimizerModelData[0],
            optimizerModelData[1]
          );
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(trainingSessionHandle, "Error occurred when trying to create a TrainingSession", false);
        return trainingSessionHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseSession && trainingSessionHandle !== 0) {
          wasm2._OrtTrainingReleaseSession(trainingSessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(trainModelData[0]);
        wasm2._free(evalModelData[0]);
        wasm2._free(optimizerModelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
      }
    };
    createAndAllocateTensors = (trainingSessionId, indices, tensors, tensorHandles, inputOutputAllocs, indexAdd) => {
      const count = indices.length;
      for (let i = 0; i < count; i++) {
        prepareInputOutputTensor(
          tensors[i],
          tensorHandles,
          inputOutputAllocs,
          trainingSessionId,
          indexAdd + indices[i]
        );
      }
      const wasm2 = getInstance();
      const valuesOffset = wasm2.stackAlloc(count * 4);
      let valuesIndex = valuesOffset / 4;
      for (let i = 0; i < count; i++) {
        wasm2.HEAPU32[valuesIndex++] = tensorHandles[i];
      }
      return valuesOffset;
    };
    moveOutputToTensorMetadataArr = (outputValuesOffset, outputCount, outputTensorHandles, outputTensors) => {
      const wasm2 = getInstance();
      const output = [];
      for (let i = 0; i < outputCount; i++) {
        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
        if (tensor === outputTensorHandles[i]) {
          output.push(outputTensors[i]);
          continue;
        }
        const beforeGetTensorDataStack = wasm2.stackSave();
        const tensorDataOffset = wasm2.stackAlloc(4 * 4);
        let type, dataOffset = 0;
        try {
          const errorCode = wasm2._OrtGetTensorData(
            tensor,
            tensorDataOffset,
            tensorDataOffset + 4,
            tensorDataOffset + 8,
            tensorDataOffset + 12
          );
          ifErrCodeCheckLastError(errorCode, `Can't access output tensor data on index ${i}.`);
          let tensorDataIndex = tensorDataOffset / 4;
          const dataType = wasm2.HEAPU32[tensorDataIndex++];
          dataOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
          const dims = [];
          for (let i2 = 0; i2 < dimsLength; i2++) {
            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
          }
          wasm2._OrtFree(dimsOffset);
          const size = dims.reduce((a, b) => a * b, 1);
          type = tensorDataTypeEnumToString(dataType);
          if (type === "string") {
            const stringData = [];
            let dataIndex = dataOffset / 4;
            for (let i2 = 0; i2 < size; i2++) {
              const offset = wasm2.HEAPU32[dataIndex++];
              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
            }
            output.push([type, dims, stringData, "cpu"]);
          } else {
            const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
            const data = new typedArrayConstructor(size);
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
            output.push([type, dims, data, "cpu"]);
          }
        } finally {
          wasm2.stackRestore(beforeGetTensorDataStack);
          if (type === "string" && dataOffset) {
            wasm2._free(dataOffset);
          }
          wasm2._OrtReleaseTensor(tensor);
        }
      }
      return output;
    };
    lazyResetGrad = async (trainingSessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingLazyResetGrad) {
        const errorCode = wasm2._OrtTrainingLazyResetGrad(trainingSessionId);
        ifErrCodeCheckLastError(errorCode, "Can't call lazyResetGrad.");
      } else {
        throw new Error(NO_TRAIN_FUNCS_MSG);
      }
    };
    runTrainStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingRunTrainStep) {
          const errorCode = wasm2._OrtTrainingRunTrainStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingRunTrainStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runOptimizerStep = async (trainingSessionId, options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        if (wasm2._OrtTrainingOptimizerStep) {
          const errCode = wasm2._OrtTrainingOptimizerStep(trainingSessionId, runOptionsHandle);
          ifErrCodeCheckLastError(errCode, "Failed to call OrtTrainingOptimizerStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runEvalStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingEvalStep) {
          const errorCode = wasm2._OrtTrainingEvalStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingEvalStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    getParametersSize = (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const sizeOffset = wasm2.stackAlloc(4);
        if (wasm2._OrtTrainingGetParametersSize) {
          const errorCode = wasm2._OrtTrainingGetParametersSize(trainingSessionId, sizeOffset, trainableOnly);
          ifErrCodeCheckLastError(errorCode, "Can't get parameters size");
          return wasm2.HEAP32[sizeOffset / 4];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getContiguousParameters = async (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const parametersSize = getParametersSize(trainingSessionId, trainableOnly);
      let tensor = 0;
      const paramsByteLength = 4 * parametersSize;
      const paramsOffset = wasm2._malloc(paramsByteLength);
      const dims = [parametersSize];
      const dimsOffset = wasm2.stackAlloc(4);
      const dimsIndex = dimsOffset / 4;
      wasm2.HEAP32[dimsIndex] = parametersSize;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          paramsOffset,
          paramsByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(
          tensor,
          `Can't create tensor for getContiguousParameters. session=${trainingSessionId}.`,
          false
        );
        if (wasm2._OrtTrainingCopyParametersToBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersToBuffer(trainingSessionId, tensor, parametersSize, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't get contiguous parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        const typedArrayConstructor = tensorTypeToTypedArrayConstructor(tensorTypeAsString);
        const data = new typedArrayConstructor(parametersSize);
        const output = [];
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(paramsOffset, paramsOffset + paramsByteLength));
        output.push([tensorTypeAsString, dims, data, locationAsString]);
        if (output.length !== 1) {
          throw new Error(`something unexpected happened in the getContiguousParameters function. Expected output length of
     one, got ${output.length}`);
        } else {
          return output[0];
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2._free(paramsOffset);
        wasm2._free(dimsOffset);
        wasm2.stackRestore(stack);
      }
    };
    loadParametersBuffer = async (trainingSessionId, buffer, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const bufferByteLength = buffer.length;
      const bufferCount = bufferByteLength / 4;
      const bufferOffset = wasm2._malloc(bufferByteLength);
      wasm2.HEAPU8.set(buffer, bufferOffset);
      const dimsOffset = wasm2.stackAlloc(4);
      wasm2.HEAP32[dimsOffset / 4] = bufferCount;
      const dimsLength = 1;
      let tensor = 0;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          bufferOffset,
          bufferByteLength,
          dimsOffset,
          dimsLength,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(tensor, `Can't create tensor for input/output. session=${trainingSessionId}`, false);
        if (wasm2._OrtTrainingCopyParametersFromBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersFromBuffer(trainingSessionId, tensor, bufferCount, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't copy buffer to parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2.stackRestore(stack);
        wasm2._free(bufferOffset);
        wasm2._free(dimsOffset);
      }
    };
    releaseTrainingSessionAndCheckpoint = (checkpointId, sessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingReleaseSession) {
        wasm2._OrtTrainingReleaseSession(sessionId);
      }
      if (wasm2._OrtTrainingReleaseCheckpoint) {
        wasm2._OrtTrainingReleaseCheckpoint(checkpointId);
      }
    };
  }
});

// web/lib/wasm/session-handler-training.ts
var OnnxruntimeWebAssemblyTrainingSessionHandler;
var init_session_handler_training = __esm({
  "web/lib/wasm/session-handler-training.ts"() {
    "use strict";
    init_session_handler_inference();
    init_wasm_core_impl();
    init_wasm_training_core_impl();
    OnnxruntimeWebAssemblyTrainingSessionHandler = class {
      constructor() {
        this.evalInputNames = [];
        this.evalOutputNames = [];
      }
      async uriOrBufferToHeap(uriOrBuffer) {
        let buffer;
        if (typeof uriOrBuffer === "string") {
          const response = await fetch(uriOrBuffer);
          const arrayBuffer = await response.arrayBuffer();
          buffer = new Uint8Array(arrayBuffer);
        } else {
          buffer = uriOrBuffer;
        }
        return copyFromExternalBuffer(buffer);
      }
      async createTrainingSession(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const checkpointData = await this.uriOrBufferToHeap(checkpointStateUriOrBuffer);
        const trainModelData = await this.uriOrBufferToHeap(trainModelUriOrBuffer);
        let evalModelData = [0, 0];
        let optimizerModelData = [0, 0];
        if (evalModelUriOrBuffer !== "") {
          evalModelData = await this.uriOrBufferToHeap(evalModelUriOrBuffer);
        }
        if (optimizerModelUriOrBuffer !== "") {
          optimizerModelData = await this.uriOrBufferToHeap(optimizerModelUriOrBuffer);
        }
        this.checkpointId = createCheckpointHandle(checkpointData);
        this.sessionId = createTrainingSessionHandle(this.checkpointId, trainModelData, evalModelData, optimizerModelData, options);
        [this.inputNames, this.outputNames] = getModelInputOutputNames(this.sessionId, false);
        if (evalModelUriOrBuffer !== "") {
          [this.evalInputNames, this.evalOutputNames] = getModelInputOutputNames(this.sessionId, true);
        }
      }
      /**
       * Helper method that converts a feeds or fetches datatype to two arrays, one of values and one that stores the
       * corresponding name as a number referring to the index in the list of names provided.
       *
       * @param feeds meant to match either SessionHandler.FeedsType or SessionHandler.FetchesType
       * @param names either inputNames or outputNames
       * @returns a tuple of a list of values and a list of indices.
       */
      convertMapIntoValuesArrayAndIndicesArray(feeds, names, mapFunc) {
        const values = [];
        const indices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = names.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}`);
          }
          values.push(tensor);
          indices.push(index);
        });
        const uList = values.map(mapFunc);
        return [values, indices, uList];
      }
      /**
       * Helper method that converts the TensorMetadata that the wasm-core functions return to the
       * SessionHandler.ReturnType. Any outputs in the provided outputArray that are falsy will be populated with the
       * corresponding result.
       *
       * @param results used to populate the resultMap if there is no value for that outputName already
       * @param outputArray used to populate the resultMap. If null or undefined, use the corresponding result from results
       * @param outputIndices specifies which outputName the corresponding value for outputArray refers to.
       * @returns a map of output names and OnnxValues.
       */
      convertTensorMetadataToReturnType(results, outputArray, outputIndices) {
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      async lazyResetGrad() {
        await lazyResetGrad(this.sessionId);
      }
      async runTrainStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.inputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.outputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await runTrainStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async runOptimizerStep(options) {
        await runOptimizerStep(this.sessionId, options);
      }
      async runEvalStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.evalInputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.evalInputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.evalOutputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.evalOutputNames[outputIndices[i]]}"`) : null
        );
        const results = await runEvalStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async getParametersSize(trainableOnly) {
        return getParametersSize(this.sessionId, trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly) {
        await loadParametersBuffer(this.sessionId, array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly) {
        const tensorResult = await getContiguousParameters(this.sessionId, trainableOnly);
        return decodeTensorMetadata(tensorResult);
      }
      async dispose() {
        return releaseTrainingSessionAndCheckpoint(this.checkpointId, this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm-training.ts
var backend_wasm_training_exports = {};
__export(backend_wasm_training_exports, {
  wasmBackend: () => wasmBackend
});
var OnnxruntimeTrainingWebAssemblyBackend, wasmBackend;
var init_backend_wasm_training = __esm({
  "web/lib/backend-wasm-training.ts"() {
    "use strict";
    init_backend_wasm();
    init_session_handler_training();
    OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
      async createTrainingSessionHandler(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblyTrainingSessionHandler();
        await handler.createTrainingSession(
          checkpointStateUriOrBuffer,
          trainModelUriOrBuffer,
          evalModelUriOrBuffer,
          optimizerModelUriOrBuffer,
          options
        );
        return Promise.resolve(handler);
      }
    };
    wasmBackend = new OnnxruntimeTrainingWebAssemblyBackend();
  }
});

// web/lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  default: () => lib_default,
  env: () => env2,
  registerBackend: () => registerBackend
});
module.exports = __toCommonJS(lib_exports);
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.17.0";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = false ? null.wasmBackend : (init_backend_wasm_training(), __toCommonJS(backend_wasm_training_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
    registerBackend("webnn", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });