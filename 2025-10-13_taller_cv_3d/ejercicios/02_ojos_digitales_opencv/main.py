import cv2 as cv 
import numpy as np 
import tkinter as tk 
import time
from tkinter import ttk

def nothing(x):
    pass 


def hsvFilter(width, height):
    cap = cv.VideoCapture(0)
    names = ["frame", "mask", "result", "Trackbars"]

    for name in names:
        cv.namedWindow(name)

    for i, name in enumerate(names, start = 0):
        col = i % 2 
        row = i // 2 
        cv.waitKey(1)
        cv.moveWindow(name, width // 2 * col, height // 2 * row)
        cv.resizeWindow(name, width // 2, height // 2)

    cv.createTrackbar("L - H", "Trackbars", 0, 179, nothing)
    cv.createTrackbar("L - S", "Trackbars", 0, 255, nothing)
    cv.createTrackbar("L - V", "Trackbars", 0, 255, nothing)
    cv.createTrackbar("U - H", "Trackbars", 0, 179, nothing)
    cv.createTrackbar("U - S", "Trackbars", 0, 255, nothing)
    cv.createTrackbar("U - V", "Trackbars", 0, 255, nothing)

    while True:
        _,frame = cap.read()
        hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)

        l_h = cv.getTrackbarPos("L - H", "Trackbars")
        l_s = cv.getTrackbarPos("L - S", "Trackbars")
        l_v = cv.getTrackbarPos("L - V", "Trackbars")
        u_h = cv.getTrackbarPos("U - H", "Trackbars")
        u_s = cv.getTrackbarPos("U - S", "Trackbars")
        u_v = cv.getTrackbarPos("U - V", "Trackbars")

        lower = np.array([l_h, l_s, l_v])
        upper = np.array([u_h, u_s, u_v])

        mask = cv.inRange(hsv, lower, upper)
        result = cv.bitwise_and(frame, frame, mask = mask)

        cv.imshow("frame", frame)
        cv.imshow("mask", mask)
        cv.imshow("result", result)


        key = cv.waitKey(1)
        if key == 27:
            break
    cv.destroyAllWindows()
    cap.release()


def grayFilter(width, height):
    cap = cv.VideoCapture(0)

    for name in ["frame", "gray"]:
        cv.namedWindow(name)

    cv.moveWindow("frame", 0, 0)
    cv.resizeWindow("frame", width // 2, height // 2)
    
    cv.moveWindow("gray", width // 2, 0)
    cv.resizeWindow("gray", width // 2, height // 2)

    while True:
        _, frame = cap.read()
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)

        cv.imshow("frame", frame)
        cv.imshow("gray", gray)

        key = cv.waitKey(1)
        if key == 27:
            break 
    cv.destroyAllWindows()
    cap.release()


def blurFilter(width, height):
    cap = cv.VideoCapture(0)
    names = ["frame", "gauss", "average", "median", "highpass", "sharpen"]
    for name in names:
        cv.namedWindow(name)

    for i, name in enumerate(names, start = 0):
        col = i % 3 
        row = i // 3 
        cv.waitKey(1)
        cv.moveWindow(name, width // 3 * col, height // 2 * row)
        cv.resizeWindow(name, width // 3, height // 2)

    kernelSharp = np.array ([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    kernelHighpass = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])

    while True:
        _, frame = cap.read()
        average = cv.blur(frame, (15, 15))
        gauss = cv.GaussianBlur(frame, (25, 25), 0) 
        median = cv.medianBlur(frame, 15)
        sharpen = cv.filter2D(frame, -1, kernelSharp)
        highpass = cv.filter2D(frame, -1, kernelHighpass)
        for name in names:
            cv.imshow(name, locals()[name])

        key = cv.waitKey(1)
        if key == 27:
            break 
    cv.destroyAllWindows()
    cap.release()


def sobelFilter(width, height):
    cap = cv.VideoCapture(0)
    names = ["frame", "sobelxy", "sobelx", "sobely", "sobelxycombined"]

    for name in names:
        cv.namedWindow(name)

    for i, name in enumerate(names, start = 0):
        row = i % 2 
        col = i // 2 
        cv.waitKey(1)
        cv.moveWindow(name, width // 3 * col, height // 2 * row )
        cv.resizeWindow(name, width // 3, height // 2)

    while True:
        _, frame = cap.read()
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        sobelxy = cv.Sobel(gray, cv.CV_64F, 1, 1, ksize=5) 
        sobelx = cv.Sobel(gray, cv.CV_64F, 1, 0, ksize=5) 
        sobely = cv.Sobel(gray, cv.CV_64F, 0, 1, ksize=5) 
        sobelxy = cv.convertScaleAbs(sobelxy) 
        sobelx = cv.convertScaleAbs(sobelx)
        sobely = cv.convertScaleAbs(sobely) 
        sobelxycombined = cv.addWeighted(sobelx, 0.5, sobely, 0.5, 0)
        for name in names:
            cv.imshow(name, locals()[name])

        key = cv.waitKey(1)
        if key == 27:
            break 
    cv.destroyAllWindows()
    cap.release()


def laplacianFilter(width, height):
    cap = cv.VideoCapture(0)

    for name in ["frame", "laplacian"]:
        cv.namedWindow(name)

    cv.moveWindow("frame", 0, 0)
    cv.resizeWindow("frame", width // 2, height // 2)

    cv.moveWindow("laplacian", width // 2, 0)
    cv.resizeWindow("laplacian", width // 2, height // 2)

    while True:
        _, frame = cap.read()
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        laplacian = cv.Laplacian(gray, cv.CV_64F)
        laplacian = cv.convertScaleAbs(laplacian)

        cv.imshow("frame", frame)
        cv.imshow("laplacian", laplacian)

        key = cv.waitKey(1)
        if key == 27:
            break 
    cv.destroyAllWindows()
    cap.release()


def allFilters(width, height, color = "red"):
    cap = cv.VideoCapture(0)
    names = ["frame", "gray", "blur", "sobel", "laplacian", "result"]
    for name in names:
        cv.namedWindow(name)

    for i,name in enumerate(names, start = 0):
        col = i % 3
        row = i // 3
        cv.waitKey(1)
        cv.moveWindow(name, (width // 3) * col, (height // 2) * row)
        cv.resizeWindow(name, width // 3, height // 2)

    dict = {"red" : [np.array([180, 255, 255]), np.array([159, 50, 70])], 
            "blue" : [np.array([128, 255, 255]), np.array([90, 50, 70])], 
            "yellow" : [np.array([35, 255, 255]), np.array([25, 50, 70])], 
            "orange" : [np.array([24, 255, 255]), np.array([10, 50, 70])],
            "black" : [np.array([180, 255, 255]), np.array([0, 0, 0])], 
            "purple" : [np.array([158, 255, 255]), np.array([129, 50, 70])],
            "gray" : [np.array([180, 18, 230]), np.array([0, 0, 40])], 
            "white" : [np.array([180, 18, 255]), np.array([0, 0, 231])]
            }

    while True:
        _, frame = cap.read()

        hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
        mask = cv.inRange(hsv, dict[color][1], dict[color][0])
        result = cv.bitwise_and(frame, frame, mask = mask)

        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)

        sobelx = cv.Sobel(gray, cv.CV_64F, 1, 0, ksize = 5)
        sobely = cv.Sobel(gray, cv.CV_64F, 0, 1, ksize = 5)
        sobelx = cv.convertScaleAbs(sobelx)
        sobely = cv.convertScaleAbs(sobely)
        sobel = cv.addWeighted(sobelx, 0.5, sobely, 0.5, 0)

        blur = cv.GaussianBlur(frame, (25, 25), 0) 

        laplacian = cv.Laplacian(gray, cv.CV_64F)
        laplacian = cv.convertScaleAbs(laplacian)

        
        for name in names:
            cv.imshow(name, locals()[name])

        key = cv.waitKey(1)
        if key == 27:
            break 
    cv.destroyAllWindows()
    cap.release()

def filters(width, height, filt = 5, color = "red"):
    match filt:
        case 0:
            grayFilter(width, height)
        case 1:
            blurFilter(width, height)
        case 2:
            sobelFilter(width, height)
        case 3:
            laplacianFilter(width, height)
        case 4:
            hsvFilter(width, height)
        case _:
            allFilters(width, height, color)


def filtMiddle(width, height, selected, color = "red"):
    if selected in range(5):
        filters(width, height, selected)
    else:
        filters(width, height, selected, color)

def main():
    root = tk.Tk()
    root.title("Main program")
    root.geometry("250x150")
    root.configure(bg = "#d9d9d9")
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()

    title = tk.Label(root, text = "Filter selector for Digital Eyes program", font =("Arial", 18, "bold"))
    title.pack(pady = 12)

    mainFrame = tk.Frame(root, bg = "#e3e3e3", bd = 2, relief = "groove")
    mainFrame.pack(padx = 20, pady = 8, fill = "both", expand = True)

    allFiltFrame = tk.LabelFrame(mainFrame, text = "HSV Color Filters", 
                                 bg = "#e3e3e3", font = ("Arial", 12, "bold") )
    allFiltFrame.grid(row = 0, column = 0, padx = 15, pady = 15, sticky = "nsew")

    selectFrame = tk.LabelFrame(mainFrame, text = "Select unique filter",
                                bg = "#e3e3e3", font = ("Arial", 12, "bold") )
    selectFrame.grid(row = 0, column = 1, padx = 15, pady = 15, sticky = "nsew")

    controlFrame = tk.Frame(root, bg = "#d9d9d9")
    controlFrame.pack(pady = 5)

    filtSelect = tk.IntVar()
    tk.Radiobutton(allFiltFrame, text = "Show all filters", variable = filtSelect, value = 5).pack(pady = 4, anchor = tk.W)    
    
    dict = {0: "red", 1: "blue", 2: "white", 3: "black", 
            4: "orange", 5: "yellow", 6: "purple", 7: "gray"}

    colorSelect = tk.IntVar()
    for i in range(len(dict)):
        tk.Radiobutton(allFiltFrame, text = f"HSV filter {dict[i]}", variable = colorSelect, value = i).pack(pady = 4, anchor = tk.W)

    filtDict = {0: "Gray", 1: "Blur/Sharpen", 2: "Sobel X/Y", 3: "Laplacian", 4: "HSVFilter"}

    for j in range(len(filtDict)):
        tk.Radiobutton(selectFrame, text = f"{filtDict[j]}", variable = filtSelect, value = j).pack(pady = 5, anchor = tk.W)
    tk.Button(controlFrame, text = "RUN FILTERS", command = lambda: filtMiddle(screen_width, screen_height, filtSelect.get(), dict[colorSelect.get()])).pack(pady = 5)
    tk.Button(controlFrame, text = "CLOSE PROGRAM", command = root.destroy).pack(pady = 0)
    root.mainloop()


if __name__ == "__main__":
    main()
