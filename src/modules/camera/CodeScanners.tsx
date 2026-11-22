import { useRef } from 'react';
import {
  useBarcodeScannerOutput,
  type BarcodeFormat,
  type TargetBarcodeFormat,
} from 'react-native-vision-camera-barcode-scanner';
import { CameraPreview, useCameraActive } from '@/modules/camera/CameraView';

export type ScannedCode = { value: string; format: BarcodeFormat };

type ScannerProps = {
  onScan: (code: ScannedCode) => void;
  onError: (error: unknown) => void;
  enabled?: boolean;
};

const qrFormats: TargetBarcodeFormat[] = ['qr-code'];
const barcodeFormats: TargetBarcodeFormat[] = [
  'code-128',
  'code-39',
  'code-93',
  'codabar',
  'ean-13',
  'ean-8',
  'itf',
  'upc-a',
  'upc-e',
  'data-matrix',
  'pdf-417',
  'aztec',
];

const CodeScannerView = ({
  formats,
  onScan,
  onError,
  enabled = true,
}: ScannerProps & { formats: TargetBarcodeFormat[] }) => {
  const active = useCameraActive(enabled);
  const previous = useRef<{ value: string; format: BarcodeFormat; timestamp: number } | null>(null);
  const output = useBarcodeScannerOutput({
    barcodeFormats: formats,
    onError,
    onBarcodeScanned: (codes) => {
      if (!active) return;

      const first = codes.find((code) => code.rawValue !== undefined);
      if (first?.rawValue === undefined) return;

      const { rawValue: value, format } = first;
      const timestamp = Date.now();
      const last = previous.current;
      if (last?.value === value && last.format === format && timestamp - last.timestamp < 1000)
        return;

      previous.current = { value, format, timestamp };
      onScan({ value, format });
    },
  });

  return <CameraPreview active={active} outputs={[output]} onError={onError} />;
};

export const QrScanner = (props: ScannerProps) => (
  <CodeScannerView {...props} formats={qrFormats} />
);

export const BarcodeScanner = (props: ScannerProps & { formats?: TargetBarcodeFormat[] }) => (
  <CodeScannerView {...props} formats={props.formats ?? barcodeFormats} />
);
