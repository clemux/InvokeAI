import { getStore } from 'app/store/nanostores/store';
import type { LoRA } from 'features/lora/store/loraSlice';
import type {
  ControlNetConfigMetadata,
  ControlNetConfigV2Metadata,
  IPAdapterConfigMetadata,
  IPAdapterConfigV2Metadata,
  MetadataValidateFunc,
  T2IAdapterConfigMetadata,
  T2IAdapterConfigV2Metadata,
} from 'features/metadata/types';
import { InvalidModelConfigError } from 'features/metadata/util/modelFetchingHelpers';
import type { ParameterSDXLRefinerModel, ParameterVAEModel } from 'features/parameters/types/parameterSchemas';
import type { BaseModelType } from 'services/api/types';

/**
 * Checks the given base model type against the currently-selected model's base type and throws an error if they are
 * incompatible.
 * @param base The base model type to validate.
 * @param message An optional message to use in the error if the base model is incompatible.
 */
const validateBaseCompatibility = (base?: BaseModelType, message?: string) => {
  if (!base) {
    throw new InvalidModelConfigError(message || 'Missing base');
  }
  const currentBase = getStore().getState().generation.model?.base;
  if (currentBase && base !== currentBase) {
    throw new InvalidModelConfigError(message || `Incompatible base models: ${base} and ${currentBase}`);
  }
};

const validateRefinerModel: MetadataValidateFunc<ParameterSDXLRefinerModel> = (refinerModel) => {
  validateBaseCompatibility('sdxl', 'Refiner incompatible with currently-selected model');
  return new Promise((resolve) => resolve(refinerModel));
};

const validateVAEModel: MetadataValidateFunc<ParameterVAEModel> = (vaeModel) => {
  validateBaseCompatibility(vaeModel.base, 'VAE incompatible with currently-selected model');
  return new Promise((resolve) => resolve(vaeModel));
};

const validateLoRA: MetadataValidateFunc<LoRA> = (lora) => {
  validateBaseCompatibility(lora.model.base, 'LoRA incompatible with currently-selected model');
  return new Promise((resolve) => resolve(lora));
};

const validateLoRAs: MetadataValidateFunc<LoRA[]> = (loras) => {
  const validatedLoRAs: LoRA[] = [];
  loras.forEach((lora) => {
    try {
      validateBaseCompatibility(lora.model.base, 'LoRA incompatible with currently-selected model');
      validatedLoRAs.push(lora);
    } catch {
      // This is a no-op - we want to continue validating the rest of the LoRAs, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedLoRAs));
};

const validateControlNet: MetadataValidateFunc<ControlNetConfigMetadata> = (controlNet) => {
  validateBaseCompatibility(controlNet.model?.base, 'ControlNet incompatible with currently-selected model');
  return new Promise((resolve) => resolve(controlNet));
};

const validateControlNets: MetadataValidateFunc<ControlNetConfigMetadata[]> = (controlNets) => {
  const validatedControlNets: ControlNetConfigMetadata[] = [];
  controlNets.forEach((controlNet) => {
    try {
      validateBaseCompatibility(controlNet.model?.base, 'ControlNet incompatible with currently-selected model');
      validatedControlNets.push(controlNet);
    } catch {
      // This is a no-op - we want to continue validating the rest of the ControlNets, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedControlNets));
};

const validateT2IAdapter: MetadataValidateFunc<T2IAdapterConfigMetadata> = (t2iAdapter) => {
  validateBaseCompatibility(t2iAdapter.model?.base, 'T2I Adapter incompatible with currently-selected model');
  return new Promise((resolve) => resolve(t2iAdapter));
};

const validateT2IAdapters: MetadataValidateFunc<T2IAdapterConfigMetadata[]> = (t2iAdapters) => {
  const validatedT2IAdapters: T2IAdapterConfigMetadata[] = [];
  t2iAdapters.forEach((t2iAdapter) => {
    try {
      validateBaseCompatibility(t2iAdapter.model?.base, 'T2I Adapter incompatible with currently-selected model');
      validatedT2IAdapters.push(t2iAdapter);
    } catch {
      // This is a no-op - we want to continue validating the rest of the T2I Adapters, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedT2IAdapters));
};

const validateIPAdapter: MetadataValidateFunc<IPAdapterConfigMetadata> = (ipAdapter) => {
  validateBaseCompatibility(ipAdapter.model?.base, 'IP Adapter incompatible with currently-selected model');
  return new Promise((resolve) => resolve(ipAdapter));
};

const validateIPAdapters: MetadataValidateFunc<IPAdapterConfigMetadata[]> = (ipAdapters) => {
  const validatedIPAdapters: IPAdapterConfigMetadata[] = [];
  ipAdapters.forEach((ipAdapter) => {
    try {
      validateBaseCompatibility(ipAdapter.model?.base, 'IP Adapter incompatible with currently-selected model');
      validatedIPAdapters.push(ipAdapter);
    } catch {
      // This is a no-op - we want to continue validating the rest of the IP Adapters, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedIPAdapters));
};

const validateControlNetV2: MetadataValidateFunc<ControlNetConfigV2Metadata> = (controlNet) => {
  validateBaseCompatibility(controlNet.model?.base, 'ControlNet incompatible with currently-selected model');
  return new Promise((resolve) => resolve(controlNet));
};

const validateControlNetsV2: MetadataValidateFunc<ControlNetConfigV2Metadata[]> = (controlNets) => {
  const validatedControlNets: ControlNetConfigV2Metadata[] = [];
  controlNets.forEach((controlNet) => {
    try {
      validateBaseCompatibility(controlNet.model?.base, 'ControlNet incompatible with currently-selected model');
      validatedControlNets.push(controlNet);
    } catch {
      // This is a no-op - we want to continue validating the rest of the ControlNets, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedControlNets));
};

const validateT2IAdapterV2: MetadataValidateFunc<T2IAdapterConfigV2Metadata> = (t2iAdapter) => {
  validateBaseCompatibility(t2iAdapter.model?.base, 'T2I Adapter incompatible with currently-selected model');
  return new Promise((resolve) => resolve(t2iAdapter));
};

const validateT2IAdaptersV2: MetadataValidateFunc<T2IAdapterConfigV2Metadata[]> = (t2iAdapters) => {
  const validatedT2IAdapters: T2IAdapterConfigV2Metadata[] = [];
  t2iAdapters.forEach((t2iAdapter) => {
    try {
      validateBaseCompatibility(t2iAdapter.model?.base, 'T2I Adapter incompatible with currently-selected model');
      validatedT2IAdapters.push(t2iAdapter);
    } catch {
      // This is a no-op - we want to continue validating the rest of the T2I Adapters, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedT2IAdapters));
};

const validateIPAdapterV2: MetadataValidateFunc<IPAdapterConfigV2Metadata> = (ipAdapter) => {
  validateBaseCompatibility(ipAdapter.model?.base, 'IP Adapter incompatible with currently-selected model');
  return new Promise((resolve) => resolve(ipAdapter));
};

const validateIPAdaptersV2: MetadataValidateFunc<IPAdapterConfigV2Metadata[]> = (ipAdapters) => {
  const validatedIPAdapters: IPAdapterConfigV2Metadata[] = [];
  ipAdapters.forEach((ipAdapter) => {
    try {
      validateBaseCompatibility(ipAdapter.model?.base, 'IP Adapter incompatible with currently-selected model');
      validatedIPAdapters.push(ipAdapter);
    } catch {
      // This is a no-op - we want to continue validating the rest of the IP Adapters, and an empty list is valid.
    }
  });
  return new Promise((resolve) => resolve(validatedIPAdapters));
};

export const validators = {
  refinerModel: validateRefinerModel,
  vaeModel: validateVAEModel,
  lora: validateLoRA,
  loras: validateLoRAs,
  controlNet: validateControlNet,
  controlNets: validateControlNets,
  t2iAdapter: validateT2IAdapter,
  t2iAdapters: validateT2IAdapters,
  ipAdapter: validateIPAdapter,
  ipAdapters: validateIPAdapters,
  controlNetV2: validateControlNetV2,
  controlNetsV2: validateControlNetsV2,
  t2iAdapterV2: validateT2IAdapterV2,
  t2iAdaptersV2: validateT2IAdaptersV2,
  ipAdapterV2: validateIPAdapterV2,
  ipAdaptersV2: validateIPAdaptersV2,
} as const;
