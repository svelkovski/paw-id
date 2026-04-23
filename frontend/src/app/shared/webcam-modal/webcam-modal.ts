import { Component, EventEmitter, Output } from '@angular/core';
import { WebcamImage, WebcamModule, WebcamInitError } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-webcam-modal',
  standalone: true,
  imports: [WebcamModule],
  templateUrl: './webcam-modal.html'
})
export class WebcamModalComponent {
  @Output() photoTaken = new EventEmitter<File>();
  @Output() cancelled  = new EventEmitter<void>();

  errorMsg: string | null = null;

  private readonly triggerSubject = new Subject<void>();
  readonly triggerObservable: Observable<void> = this.triggerSubject.asObservable();

  trigger(): void {
    this.triggerSubject.next();
  }

  onCapture(image: WebcamImage): void {
    const file = dataUrlToFile(image.imageAsDataUrl, 'webcam-photo.jpg');
    this.photoTaken.emit(file);
  }

  onError(error: WebcamInitError): void {
    console.error('Webcam init error', error);
    const name = error?.mediaStreamError?.name;
    if (name === 'NotAllowedError') {
      this.errorMsg = 'Camera permission was denied. Please allow camera access in your browser settings.';
    } else if (name === 'NotFoundError') {
      this.errorMsg = 'No camera was found on this device.';
    } else if (name === 'NotReadableError') {
      this.errorMsg = 'Camera is already in use by another application.';
    } else {
      this.errorMsg = error?.message || 'Could not access the camera. Please allow camera access or use "Upload file" instead.';
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(_event: MouseEvent): void {
    this.cancelled.emit();
  }
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
