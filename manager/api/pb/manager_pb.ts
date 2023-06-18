// @generated by protoc-gen-es v1.2.1 with parameter "target=ts"
// @generated from file manager.proto (package haven, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from enum haven.Status
 */
export enum Status {
  /**
   * @generated from enum value: RUNNING = 0;
   */
  RUNNING = 0,

  /**
   * Worker doesn't exist.
   *
   * @generated from enum value: STOPPED = 1;
   */
  STOPPED = 1,

  /**
   * @generated from enum value: STARTING = 2;
   */
  STARTING = 2,

  /**
   * When going to STOPPED or PAUSED.
   *
   * @generated from enum value: STOPPING = 3;
   */
  STOPPING = 3,

  /**
   * @generated from enum value: PAUSED = 4;
   */
  PAUSED = 4,

  /**
   * @generated from enum value: ERROR = 5;
   */
  ERROR = 5,
}
// Retrieve enum metadata with: proto3.getEnumType(Status)
proto3.util.setEnumType(Status, "haven.Status", [
  { no: 0, name: "RUNNING" },
  { no: 1, name: "STOPPED" },
  { no: 2, name: "STARTING" },
  { no: 3, name: "STOPPING" },
  { no: 4, name: "PAUSED" },
  { no: 5, name: "ERROR" },
]);

/**
 * @generated from message haven.Empty
 */
export class Empty extends Message<Empty> {
  constructor(data?: PartialMessage<Empty>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.Empty";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Empty {
    return new Empty().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Empty {
    return new Empty().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Empty {
    return new Empty().fromJsonString(jsonString, options);
  }

  static equals(a: Empty | PlainMessage<Empty> | undefined, b: Empty | PlainMessage<Empty> | undefined): boolean {
    return proto3.util.equals(Empty, a, b);
  }
}

/**
 * @generated from message haven.SetupRequest
 */
export class SetupRequest extends Message<SetupRequest> {
  /**
   * @generated from field: optional string key_file = 1;
   */
  keyFile?: string;

  constructor(data?: PartialMessage<SetupRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.SetupRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "key_file", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SetupRequest {
    return new SetupRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SetupRequest {
    return new SetupRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SetupRequest {
    return new SetupRequest().fromJsonString(jsonString, options);
  }

  static equals(a: SetupRequest | PlainMessage<SetupRequest> | undefined, b: SetupRequest | PlainMessage<SetupRequest> | undefined): boolean {
    return proto3.util.equals(SetupRequest, a, b);
  }
}

/**
 * @generated from message haven.GenerateRequest
 */
export class GenerateRequest extends Message<GenerateRequest> {
  /**
   * @generated from field: string worker_name = 1;
   */
  workerName = "";

  /**
   * @generated from field: string prompt = 2;
   */
  prompt = "";

  /**
   * @generated from field: optional int32 max_tokens = 3;
   */
  maxTokens?: number;

  /**
   * @generated from field: optional float temperature = 4;
   */
  temperature?: number;

  /**
   * @generated from field: optional int32 top_p = 5;
   */
  topP?: number;

  /**
   * @generated from field: optional int32 top_k = 6;
   */
  topK?: number;

  /**
   * @generated from field: optional bool sample = 7;
   */
  sample?: boolean;

  constructor(data?: PartialMessage<GenerateRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.GenerateRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "worker_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "prompt", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "max_tokens", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
    { no: 4, name: "temperature", kind: "scalar", T: 2 /* ScalarType.FLOAT */, opt: true },
    { no: 5, name: "top_p", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
    { no: 6, name: "top_k", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
    { no: 7, name: "sample", kind: "scalar", T: 8 /* ScalarType.BOOL */, opt: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GenerateRequest {
    return new GenerateRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GenerateRequest {
    return new GenerateRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GenerateRequest {
    return new GenerateRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GenerateRequest | PlainMessage<GenerateRequest> | undefined, b: GenerateRequest | PlainMessage<GenerateRequest> | undefined): boolean {
    return proto3.util.equals(GenerateRequest, a, b);
  }
}

/**
 * @generated from message haven.GenerateResponse
 */
export class GenerateResponse extends Message<GenerateResponse> {
  /**
   * @generated from field: string text = 1;
   */
  text = "";

  constructor(data?: PartialMessage<GenerateResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.GenerateResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GenerateResponse {
    return new GenerateResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GenerateResponse {
    return new GenerateResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GenerateResponse {
    return new GenerateResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GenerateResponse | PlainMessage<GenerateResponse> | undefined, b: GenerateResponse | PlainMessage<GenerateResponse> | undefined): boolean {
    return proto3.util.equals(GenerateResponse, a, b);
  }
}

/**
 * @generated from message haven.Model
 */
export class Model extends Message<Model> {
  /**
   * @generated from field: string name = 1;
   */
  name = "";

  constructor(data?: PartialMessage<Model>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.Model";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Model {
    return new Model().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Model {
    return new Model().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Model {
    return new Model().fromJsonString(jsonString, options);
  }

  static equals(a: Model | PlainMessage<Model> | undefined, b: Model | PlainMessage<Model> | undefined): boolean {
    return proto3.util.equals(Model, a, b);
  }
}

/**
 * @generated from message haven.ListModelsResponse
 */
export class ListModelsResponse extends Message<ListModelsResponse> {
  /**
   * @generated from field: repeated haven.Model models = 1;
   */
  models: Model[] = [];

  constructor(data?: PartialMessage<ListModelsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.ListModelsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "models", kind: "message", T: Model, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListModelsResponse {
    return new ListModelsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListModelsResponse {
    return new ListModelsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListModelsResponse {
    return new ListModelsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: ListModelsResponse | PlainMessage<ListModelsResponse> | undefined, b: ListModelsResponse | PlainMessage<ListModelsResponse> | undefined): boolean {
    return proto3.util.equals(ListModelsResponse, a, b);
  }
}

/**
 * @generated from message haven.AddModelRequest
 */
export class AddModelRequest extends Message<AddModelRequest> {
  /**
   * @generated from field: string model_name = 1;
   */
  modelName = "";

  /**
   * @generated from field: string tokenizer_name = 2;
   */
  tokenizerName = "";

  /**
   * @generated from field: string base_model_name = 3;
   */
  baseModelName = "";

  /**
   * @generated from field: string instruction_prefix = 4;
   */
  instructionPrefix = "";

  /**
   * @generated from field: string output_prefix = 5;
   */
  outputPrefix = "";

  /**
   * @generated from field: repeated string stop_tokens = 6;
   */
  stopTokens: string[] = [];

  constructor(data?: PartialMessage<AddModelRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.AddModelRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "model_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "tokenizer_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "base_model_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "instruction_prefix", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 5, name: "output_prefix", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 6, name: "stop_tokens", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AddModelRequest {
    return new AddModelRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AddModelRequest {
    return new AddModelRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AddModelRequest {
    return new AddModelRequest().fromJsonString(jsonString, options);
  }

  static equals(a: AddModelRequest | PlainMessage<AddModelRequest> | undefined, b: AddModelRequest | PlainMessage<AddModelRequest> | undefined): boolean {
    return proto3.util.equals(AddModelRequest, a, b);
  }
}

/**
 * @generated from message haven.ModelName
 */
export class ModelName extends Message<ModelName> {
  /**
   * @generated from field: string model_name = 1;
   */
  modelName = "";

  constructor(data?: PartialMessage<ModelName>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.ModelName";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "model_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ModelName {
    return new ModelName().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ModelName {
    return new ModelName().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ModelName {
    return new ModelName().fromJsonString(jsonString, options);
  }

  static equals(a: ModelName | PlainMessage<ModelName> | undefined, b: ModelName | PlainMessage<ModelName> | undefined): boolean {
    return proto3.util.equals(ModelName, a, b);
  }
}

/**
 * @generated from message haven.CreateInferenceWorkerRequest
 */
export class CreateInferenceWorkerRequest extends Message<CreateInferenceWorkerRequest> {
  /**
   * @generated from field: string model_name = 1;
   */
  modelName = "";

  /**
   * @generated from field: string quantization = 2;
   */
  quantization = "";

  /**
   * @generated from field: optional string worker_name = 3;
   */
  workerName?: string;

  /**
   * @generated from field: optional string gpu_type = 4;
   */
  gpuType?: string;

  /**
   * @generated from field: optional int32 gpu_count = 6;
   */
  gpuCount?: number;

  constructor(data?: PartialMessage<CreateInferenceWorkerRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.CreateInferenceWorkerRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "model_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "quantization", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "worker_name", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 4, name: "gpu_type", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 6, name: "gpu_count", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CreateInferenceWorkerRequest {
    return new CreateInferenceWorkerRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CreateInferenceWorkerRequest {
    return new CreateInferenceWorkerRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CreateInferenceWorkerRequest {
    return new CreateInferenceWorkerRequest().fromJsonString(jsonString, options);
  }

  static equals(a: CreateInferenceWorkerRequest | PlainMessage<CreateInferenceWorkerRequest> | undefined, b: CreateInferenceWorkerRequest | PlainMessage<CreateInferenceWorkerRequest> | undefined): boolean {
    return proto3.util.equals(CreateInferenceWorkerRequest, a, b);
  }
}

/**
 * @generated from message haven.InferenceWorker
 */
export class InferenceWorker extends Message<InferenceWorker> {
  /**
   * @generated from field: string worker_id = 1;
   */
  workerId = "";

  constructor(data?: PartialMessage<InferenceWorker>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.InferenceWorker";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "worker_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InferenceWorker {
    return new InferenceWorker().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InferenceWorker {
    return new InferenceWorker().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InferenceWorker {
    return new InferenceWorker().fromJsonString(jsonString, options);
  }

  static equals(a: InferenceWorker | PlainMessage<InferenceWorker> | undefined, b: InferenceWorker | PlainMessage<InferenceWorker> | undefined): boolean {
    return proto3.util.equals(InferenceWorker, a, b);
  }
}

/**
 * @generated from message haven.FinetuneRequest
 */
export class FinetuneRequest extends Message<FinetuneRequest> {
  /**
   * @generated from field: string model_name = 1;
   */
  modelName = "";

  /**
   * @generated from field: string trained_model_name = 2;
   */
  trainedModelName = "";

  /**
   * TODO(konsti): Check how we want to upload this file.
   *
   * @generated from field: string dataset = 3;
   */
  dataset = "";

  /**
   * @generated from field: optional string eval_dataset = 4;
   */
  evalDataset?: string;

  /**
   * @generated from field: optional int32 epochs = 5;
   */
  epochs?: number;

  /**
   * @generated from field: optional int32 batch_size = 6;
   */
  batchSize?: number;

  /**
   * @generated from field: optional float learning_rate = 7;
   */
  learningRate?: number;

  /**
   * @generated from field: optional string instruction_prefix = 8;
   */
  instructionPrefix?: string;

  /**
   * @generated from field: optional string output_prefix = 9;
   */
  outputPrefix?: string;

  /**
   * @generated from field: repeated string stop_tokens = 10;
   */
  stopTokens: string[] = [];

  constructor(data?: PartialMessage<FinetuneRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.FinetuneRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "model_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "trained_model_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "dataset", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "eval_dataset", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 5, name: "epochs", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
    { no: 6, name: "batch_size", kind: "scalar", T: 5 /* ScalarType.INT32 */, opt: true },
    { no: 7, name: "learning_rate", kind: "scalar", T: 2 /* ScalarType.FLOAT */, opt: true },
    { no: 8, name: "instruction_prefix", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 9, name: "output_prefix", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 10, name: "stop_tokens", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FinetuneRequest {
    return new FinetuneRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FinetuneRequest {
    return new FinetuneRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FinetuneRequest {
    return new FinetuneRequest().fromJsonString(jsonString, options);
  }

  static equals(a: FinetuneRequest | PlainMessage<FinetuneRequest> | undefined, b: FinetuneRequest | PlainMessage<FinetuneRequest> | undefined): boolean {
    return proto3.util.equals(FinetuneRequest, a, b);
  }
}

/**
 * @generated from message haven.FinetuneResponse
 */
export class FinetuneResponse extends Message<FinetuneResponse> {
  /**
   * @generated from field: string weights_and_biases_url = 1;
   */
  weightsAndBiasesUrl = "";

  constructor(data?: PartialMessage<FinetuneResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "haven.FinetuneResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "weights_and_biases_url", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FinetuneResponse {
    return new FinetuneResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FinetuneResponse {
    return new FinetuneResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FinetuneResponse {
    return new FinetuneResponse().fromJsonString(jsonString, options);
  }

  static equals(a: FinetuneResponse | PlainMessage<FinetuneResponse> | undefined, b: FinetuneResponse | PlainMessage<FinetuneResponse> | undefined): boolean {
    return proto3.util.equals(FinetuneResponse, a, b);
  }
}

