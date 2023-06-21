"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import collections.abc
import google.protobuf.descriptor
import google.protobuf.internal.containers
import google.protobuf.internal.enum_type_wrapper
import google.protobuf.message
import sys
import typing

if sys.version_info >= (3, 10):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

class _Status:
    ValueType = typing.NewType("ValueType", builtins.int)
    V: typing_extensions.TypeAlias = ValueType

class _StatusEnumTypeWrapper(google.protobuf.internal.enum_type_wrapper._EnumTypeWrapper[_Status.ValueType], builtins.type):
    DESCRIPTOR: google.protobuf.descriptor.EnumDescriptor
    RUNNING: _Status.ValueType  # 0
    STOPPED: _Status.ValueType  # 1
    """Worker doesn't exist."""
    STARTING: _Status.ValueType  # 2
    STOPPING: _Status.ValueType  # 3
    """When going to STOPPED or PAUSED."""
    PAUSED: _Status.ValueType  # 4
    ERROR: _Status.ValueType  # 5

class Status(_Status, metaclass=_StatusEnumTypeWrapper): ...

RUNNING: Status.ValueType  # 0
STOPPED: Status.ValueType  # 1
"""Worker doesn't exist."""
STARTING: Status.ValueType  # 2
STOPPING: Status.ValueType  # 3
"""When going to STOPPED or PAUSED."""
PAUSED: Status.ValueType  # 4
ERROR: Status.ValueType  # 5
global___Status = Status

class _GpuType:
    ValueType = typing.NewType("ValueType", builtins.int)
    V: typing_extensions.TypeAlias = ValueType

class _GpuTypeEnumTypeWrapper(google.protobuf.internal.enum_type_wrapper._EnumTypeWrapper[_GpuType.ValueType], builtins.type):
    DESCRIPTOR: google.protobuf.descriptor.EnumDescriptor
    A100: _GpuType.ValueType  # 0
    A100_80GB: _GpuType.ValueType  # 1
    T4: _GpuType.ValueType  # 2

class GpuType(_GpuType, metaclass=_GpuTypeEnumTypeWrapper): ...

A100: GpuType.ValueType  # 0
A100_80GB: GpuType.ValueType  # 1
T4: GpuType.ValueType  # 2
global___GpuType = GpuType

@typing_extensions.final
class Empty(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    def __init__(
        self,
    ) -> None: ...

global___Empty = Empty

@typing_extensions.final
class SetupRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    KEY_FILE_FIELD_NUMBER: builtins.int
    key_file: builtins.str
    def __init__(
        self,
        *,
        key_file: builtins.str | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["_key_file", b"_key_file", "key_file", b"key_file"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["_key_file", b"_key_file", "key_file", b"key_file"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_key_file", b"_key_file"]) -> typing_extensions.Literal["key_file"] | None: ...

global___SetupRequest = SetupRequest

@typing_extensions.final
class GenerateRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    WORKER_NAME_FIELD_NUMBER: builtins.int
    PROMPT_FIELD_NUMBER: builtins.int
    MAX_TOKENS_FIELD_NUMBER: builtins.int
    TEMPERATURE_FIELD_NUMBER: builtins.int
    TOP_P_FIELD_NUMBER: builtins.int
    TOP_K_FIELD_NUMBER: builtins.int
    SAMPLE_FIELD_NUMBER: builtins.int
    worker_name: builtins.str
    prompt: builtins.str
    max_tokens: builtins.int
    temperature: builtins.float
    top_p: builtins.int
    top_k: builtins.int
    sample: builtins.bool
    def __init__(
        self,
        *,
        worker_name: builtins.str = ...,
        prompt: builtins.str = ...,
        max_tokens: builtins.int | None = ...,
        temperature: builtins.float | None = ...,
        top_p: builtins.int | None = ...,
        top_k: builtins.int | None = ...,
        sample: builtins.bool | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["_max_tokens", b"_max_tokens", "_sample", b"_sample", "_temperature", b"_temperature", "_top_k", b"_top_k", "_top_p", b"_top_p", "max_tokens", b"max_tokens", "sample", b"sample", "temperature", b"temperature", "top_k", b"top_k", "top_p", b"top_p"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["_max_tokens", b"_max_tokens", "_sample", b"_sample", "_temperature", b"_temperature", "_top_k", b"_top_k", "_top_p", b"_top_p", "max_tokens", b"max_tokens", "prompt", b"prompt", "sample", b"sample", "temperature", b"temperature", "top_k", b"top_k", "top_p", b"top_p", "worker_name", b"worker_name"]) -> None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_max_tokens", b"_max_tokens"]) -> typing_extensions.Literal["max_tokens"] | None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_sample", b"_sample"]) -> typing_extensions.Literal["sample"] | None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_temperature", b"_temperature"]) -> typing_extensions.Literal["temperature"] | None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_top_k", b"_top_k"]) -> typing_extensions.Literal["top_k"] | None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_top_p", b"_top_p"]) -> typing_extensions.Literal["top_p"] | None: ...

global___GenerateRequest = GenerateRequest

@typing_extensions.final
class GenerateResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    TEXT_FIELD_NUMBER: builtins.int
    text: builtins.str
    def __init__(
        self,
        *,
        text: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["text", b"text"]) -> None: ...

global___GenerateResponse = GenerateResponse

@typing_extensions.final
class Model(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    NAME_FIELD_NUMBER: builtins.int
    name: builtins.str
    def __init__(
        self,
        *,
        name: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["name", b"name"]) -> None: ...

global___Model = Model

@typing_extensions.final
class ListModelsResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    MODELS_FIELD_NUMBER: builtins.int
    @property
    def models(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___Model]: ...
    def __init__(
        self,
        *,
        models: collections.abc.Iterable[global___Model] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["models", b"models"]) -> None: ...

global___ListModelsResponse = ListModelsResponse

@typing_extensions.final
class CreateInferenceWorkerRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    MODEL_NAME_FIELD_NUMBER: builtins.int
    QUANTIZATION_FIELD_NUMBER: builtins.int
    WORKER_NAME_FIELD_NUMBER: builtins.int
    GPU_TYPE_FIELD_NUMBER: builtins.int
    GPU_COUNT_FIELD_NUMBER: builtins.int
    model_name: builtins.str
    quantization: builtins.str
    worker_name: builtins.str
    gpu_type: global___GpuType.ValueType
    gpu_count: builtins.int
    def __init__(
        self,
        *,
        model_name: builtins.str = ...,
        quantization: builtins.str = ...,
        worker_name: builtins.str | None = ...,
        gpu_type: global___GpuType.ValueType | None = ...,
        gpu_count: builtins.int | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["_gpu_count", b"_gpu_count", "_gpu_type", b"_gpu_type", "_worker_name", b"_worker_name", "gpu_count", b"gpu_count", "gpu_type", b"gpu_type", "worker_name", b"worker_name"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["_gpu_count", b"_gpu_count", "_gpu_type", b"_gpu_type", "_worker_name", b"_worker_name", "gpu_count", b"gpu_count", "gpu_type", b"gpu_type", "model_name", b"model_name", "quantization", b"quantization", "worker_name", b"worker_name"]) -> None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_gpu_count", b"_gpu_count"]) -> typing_extensions.Literal["gpu_count"] | None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_gpu_type", b"_gpu_type"]) -> typing_extensions.Literal["gpu_type"] | None: ...
    @typing.overload
    def WhichOneof(self, oneof_group: typing_extensions.Literal["_worker_name", b"_worker_name"]) -> typing_extensions.Literal["worker_name"] | None: ...

global___CreateInferenceWorkerRequest = CreateInferenceWorkerRequest

@typing_extensions.final
class InferenceWorker(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    WORKER_ID_FIELD_NUMBER: builtins.int
    worker_id: builtins.str
    def __init__(
        self,
        *,
        worker_id: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["worker_id", b"worker_id"]) -> None: ...

global___InferenceWorker = InferenceWorker
