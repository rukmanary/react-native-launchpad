import { useEffect, useRef, useState } from 'react';
import { chooseDocument, chooseImage, cropImage } from '@/modules/media/pickers';
import { Button } from '@/shared/ui/Button';

type PickerProps<Result> = {
  label?: string;
  disabled?: boolean;
  onResult: (result: Result) => void;
  onCancel?: () => void;
  onError: (error: unknown) => void;
};

type DocumentResult = NonNullable<Awaited<ReturnType<typeof chooseDocument>>>;
type ImageResult = NonNullable<Awaited<ReturnType<typeof chooseImage>>>;
type CropResult = NonNullable<Awaited<ReturnType<typeof cropImage>>>;

let pickerOpen = false;

const PickerButton = <Result,>({
  label,
  disabled,
  pick,
  onResult,
  onCancel,
  onError,
}: Omit<PickerProps<Result>, 'label'> & {
  label: string;
  pick: () => Promise<Result | null>;
}) => {
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const open = async () => {
    if (disabled || pickerOpen) return;

    pickerOpen = true;
    setBusy(true);

    try {
      const selected = await pick();
      if (!mounted.current) return;

      if (selected === null) onCancel?.();
      else onResult(selected);
    } catch (error) {
      if (mounted.current) onError(error);
    } finally {
      pickerOpen = false;
      if (mounted.current) setBusy(false);
    }
  };

  return <Button label={label} disabled={disabled} loading={busy} onPress={() => void open()} />;
};

export const DocumentPicker = ({
  label = 'Choose a document',
  type,
  ...props
}: PickerProps<DocumentResult> & { type?: Parameters<typeof chooseDocument>[0] }) => (
  <PickerButton {...props} label={label} pick={() => chooseDocument(type)} />
);

export const ImagePicker = ({ label = 'Choose an image', ...props }: PickerProps<ImageResult>) => (
  <PickerButton {...props} label={label} pick={chooseImage} />
);

export const ImageCropPicker = ({
  label = 'Crop image',
  path,
  disabled,
  ...props
}: PickerProps<CropResult> & { path?: string }) => (
  <PickerButton
    {...props}
    label={label}
    disabled={disabled || !path}
    pick={() => (path ? cropImage(path) : Promise.resolve(null))}
  />
);
