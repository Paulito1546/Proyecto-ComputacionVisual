import cv2 as cv
import mediapipe as mp
import math

PALM_POINTS = [0, 1, 5, 9, 13, 17]
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=2,
                        min_detection_confidence=0.7,
                        min_tracking_confidence=0.5)

def get_palm_center(hand_landmarks, img_shape):
    h, w, _ = img_shape
    cx, cy = 0, 0
    for i in PALM_POINTS:
        cx += hand_landmarks.landmark[i].x * w
        cy += hand_landmarks.landmark[i].y * h
    cx = int(cx / len(PALM_POINTS))
    cy = int(cy / len(PALM_POINTS))
    return (cx, cy)

def count_fingers(hand_landmarks, hand_label):
    finger_tips = [4, 8, 12, 16, 20]
    lm = hand_landmarks.landmark
    fingers = []

    # --- Thumb ---
    if hand_label == "Right":
        fingers.append(1 if lm[finger_tips[0]].x < lm[finger_tips[0]-1].x else 0)
    else:  # Left hand (x comparison reversed)
        fingers.append(1 if lm[finger_tips[0]].x > lm[finger_tips[0]-1].x else 0)

    # --- Other fingers ---
    for tip in finger_tips[1:]:
        fingers.append(1 if lm[tip].y < lm[tip - 2].y else 0)

    return fingers, sum(fingers)

def measure_distance(lm1, lm2, shape):
    h, w, _ = shape
    x1, y1 = int(lm1.x * w), int(lm1.y * h)
    x2, y2 = int(lm2.x * w), int(lm2.y * h)
    dist = math.hypot(x2 - x1, y2 - y1)
    return dist, (x1, y1), (x2, y2)

def handCenter(handLms, frame):
    center = get_palm_center(handLms, frame.shape)
    cv.circle(frame, center, 10, (0, 255, 255), -1)
    cv.putText(frame, f'Center: {center}', (center[0] + 15, center[1]),
                cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
    return center

def listFingers(frame):

    if frame is None:
        return [0, 0, 0, 0, 0], 0, None, frame  # No frame read

    frame_rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    # Default values (no hand detected)
    fingers_list = [0, 0, 0, 0, 0]
    fingers_up = 0
    center = None    
    if results.multi_hand_landmarks and results.multi_handedness:
        for i, (handLms, handedness) in enumerate(zip(results.multi_hand_landmarks,
                                                        results.multi_handedness)):
            label = handedness.classification[0].label  # "Left" or "Right"

            # Draw landmarks
            mp_draw.draw_landmarks(frame, handLms, mp_hands.HAND_CONNECTIONS)

            # Count fingers
            fingers_list, fingers_up = count_fingers(handLms, label)

            # Measure thumb-index distance
            lm = handLms.landmark
            dist, p1, p2 = measure_distance(lm[4], lm[8], frame.shape)
            cv.line(frame, p1, p2, (255, 0, 0), 2)
            cv.circle(frame, p1, 5, (0, 0, 255), -1)
            cv.circle(frame, p2, 5, (0, 0, 255), -1)

            # Draw hand center
            center = handCenter(handLms, frame)

            # Text info
            offset_y = 40 + (i * 100)
            cv.putText(frame, f'{label} Hand: {fingers_up} fingers',
                        (30, offset_y), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv.putText(frame, f'Dist: {int(dist)} px', (30, offset_y + 30),
                        cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv.putText(frame, f'Center: {center}', (30, offset_y + 60),
                        cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    return fingers_list, fingers_up, center, frame

