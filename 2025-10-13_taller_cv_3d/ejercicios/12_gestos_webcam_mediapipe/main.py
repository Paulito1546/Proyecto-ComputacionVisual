from hands import listFingers
from camera import shCamera
from snake import snake
import numpy as np 
import cv2 as cv
import pygame
import tkinter as tk 
from tkinter import ttk 
import math
import threading
import queue
import time 

def gray(count, frame):
    if count == 5:
        frame = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    return frame


def blurr(width, position, frame):
    if position is None:
        return frame 
    xposition = position[0]
    # Map hand position (0..width) → blur strength (5..55)
    ksize = int(np.interp(xposition, [0, width], [5, 55]))
    if ksize % 2 == 0:
        ksize += 1
    return cv.GaussianBlur(frame, (ksize, ksize), 0)

    
def moveCamera(name, position):
    cv.moveWindow(name, position[0], position[1])

def selectorHandler(width, height, domain, parameters = None, fingerSelector = None):
    def run_mode():
        cv.destroyAllWindows()
        # Only create camera if NOT in Snake mode (Snake mode creates its own)
        if domain == 0:
            time.sleep(1.5)
            cap = shCamera(0)
        
            if parameters == "move":
                cv.namedWindow("Movement")
                while True:
                    _, frame = cap.read()
                    output = listFingers(frame)
                    position = output[2]
                    if position is not None:
                        moveCamera("Movement", position)
                    cv.imshow("Movement", frame)                
                    key = cv.waitKey(1)
                    if key == 27:
                        break 
                cv.destroyAllWindows()
                cap.release()
                
            elif parameters == "blur":
                cv.namedWindow("Blurred", cv.WINDOW_NORMAL)
                while True:
                    _, frame = cap.read()
                    output = listFingers(frame)
                    position = output[2]
                    blurred = blurr(width, position, frame)
                    cv.imshow("Blurred", blurred)
                    key = cv.waitKey(1)
                    if key == 27:
                        break 
                cv.destroyAllWindows()
                cap.release()
                
            else:  # gray mode
                cv.namedWindow("Grayed", cv.WINDOW_NORMAL)
                while True:
                    _, frame = cap.read()
                    output = listFingers(frame)
                    count = output[1]
                    grayed = gray(count, frame)
                    cv.imshow("Grayed", grayed)
                    key = cv.waitKey(1)
                    if key == 27:
                        break
                cv.destroyAllWindows()
                cap.release()
        
        else:  # Snake Game with gesture control
            gesture_queue = queue.Queue(maxsize=1)
            stop_event = threading.Event()
            
            def camera_worker():
                """Capture hand gestures and put them in queue"""
                # Create camera inside this thread
                time.sleep(1.5)
                cap = shCamera(0)
                cv.namedWindow("HandTrack", cv.WINDOW_NORMAL)
                
                while not stop_event.is_set():
                    ret, frame = cap.read()
                    if not ret:
                        continue
                    
                    output = listFingers(frame)
                    fingerList = output[0]  # [thumb, index, middle, ring, pinky]
                    
                    # Put latest gesture in queue
                    try:
                        gesture_queue.put_nowait(fingerList)
                    except queue.Full:
                        try:
                            gesture_queue.get_nowait()
                        except queue.Empty:
                            pass
                        gesture_queue.put_nowait(fingerList)
                    
                    cv.imshow("HandTrack", output[3])
                    
                    key = cv.waitKey(1)
                    if key == 27:
                        stop_event.set()
                        break
                
                cv.destroyAllWindows()
                cap.release()
            
            # Start camera thread
            cam_thread = threading.Thread(target=camera_worker, daemon=True)
            cam_thread.start()
            
            # Run snake game in this thread (Pygame needs to be in a thread, not main)
            try:
                snake(width, height, gesture_queue, fingerSelector)
            except Exception as e:
                print(f"Snake game error: {e}")
            finally:
                stop_event.set()
                cam_thread.join(timeout=2)
    
    # Run everything in a separate thread to keep Tkinter responsive
    mode_thread = threading.Thread(target=run_mode, daemon=True)
    mode_thread.start()


def main():
    root = tk.Tk()
    root.title("Main program")
    root.geometry("250x150")
    root.configure(bg="#d9d9d9")
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()

    title = tk.Label(root, text="Application selector for Mediapipe Hand Detector", 
                     font=("Arial", 18, "bold"))
    title.pack(pady=12)

    mainFrame = tk.Frame(root, bg="#e3e3e3", bd=2, relief="groove")
    mainFrame.pack(padx=20, pady=8, fill="both", expand=True)

    domainFrame = tk.LabelFrame(mainFrame, text="Principal application",
                                bg="#e3e3e3", font=("Arial", 12, "bold")) 
    domainFrame.grid(row=0, column=0, padx=15, pady=15, sticky="nsew")

    allFiltFrame = tk.LabelFrame(mainFrame, text="Camera adjustment", 
                                 bg="#e3e3e3", font=("Arial", 12, "bold"))
    allFiltFrame.grid(row=0, column=1, padx=15, pady=15, sticky="nsew")

    selectFrame = tk.LabelFrame(mainFrame, text="Snake Game",
                                bg="#e3e3e3", font=("Arial", 12, "bold"))
    selectFrame.grid(row=0, column=2, padx=15, pady=15, sticky="nsew")

    controlFrame = tk.Frame(root, bg="#d9d9d9")
    controlFrame.pack(pady=5)

    domains = {0: "Camera adjustment", 1: "Snake Game"}
    domainSelect = tk.IntVar()
    for i in range(len(domains)):
        tk.Radiobutton(domainFrame, text=f"{domains[i]}", variable=domainSelect, 
                      value=i).pack(pady=4, anchor=tk.W)

    modes = {0: "move", 1: "blur", 2: "gray"}
    modeSelect = tk.IntVar()
    for j in range(len(modes)):
        tk.Radiobutton(allFiltFrame, text=f"Mode {modes[j]}", variable=modeSelect, 
                      value=j).pack(pady=4, anchor=tk.W)

    fingers = ["Thumb", "Index", "Middle", "Ring", "Pinky"]
    moves = ["Left", "Right", "Up", "Down"]
    fingerSelector = {}
    for i, finger in enumerate(fingers, start=0):
        label = tk.Label(selectFrame, text=finger)
        label.pack(padx=10)
        selectBox = ttk.Combobox(selectFrame, values=moves, state="readonly")
        selectBox.pack(pady=5)
        selectBox.set(moves[i % len(moves)])
        fingerSelector[finger] = selectBox

    tk.Button(controlFrame, text="RUN CONFIGURATION", 
              command=lambda: selectorHandler(screen_width, screen_height, 
                                             domainSelect.get(), 
                                             modes[modeSelect.get()], 
                                             fingerSelector)).pack(pady=5)

    tk.Button(controlFrame, text="CLOSE PROGRAM",
          command=lambda: [cv.destroyAllWindows(), root.destroy()]).pack(pady=0)

    
    root.mainloop()


if __name__ == "__main__":
    main()
