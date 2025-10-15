import cv2 as cv
import threading

class shCamera:
    def __init__(self, index=0):
        self.index = index
        self.lock = threading.Lock()
        self.cap = None
        self.running = False
        self._open_camera()

    def _open_camera(self):
        """(Re)initialize the camera if not running."""
        with self.lock:
            if self.cap is None or not self.cap.isOpened():
                self.cap = cv.VideoCapture(self.index)
                if not self.cap.isOpened():
                    raise RuntimeError("CAMERA ERROR")
                self.running = True

    def read(self):
        """Thread-safe frame capture; reopens camera if needed."""
        with self.lock:
            if not self.running or self.cap is None or not self.cap.isOpened():
                self._open_camera()
            ret, frame = self.cap.read()
        return ret, frame

    def release(self):
        """Release camera safely."""
        with self.lock:
            if self.cap and self.cap.isOpened():
                self.cap.release()
            self.running = False
