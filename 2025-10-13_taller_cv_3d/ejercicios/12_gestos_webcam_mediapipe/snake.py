import pygame
import random
import sys
import queue
import os


def snake(width, height, gesture_queue=None, fingerSelector=None):
    pygame.init()

    # Game settings 
    WIDTH, HEIGHT = width // 2, height - 100
    CELL_SIZE = 20
    FPS = 10  # Game's speed 

    # Colors
    BLACK = (0, 0, 0)
    GREEN = (0, 255, 0)
    RED = (200, 0, 0)
    WHITE = (255, 255, 255)

    # Window's setup 
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("SNAKE GAME - Gesture Control")

    # Start position
    snake_body = [(100, 100), (80, 100), (60, 100)]
    direction = "RIGHT"

    # Apple setup 
    food = (random.randrange(0, WIDTH // CELL_SIZE) * CELL_SIZE,
            random.randrange(0, HEIGHT // CELL_SIZE) * CELL_SIZE)

    clock = pygame.time.Clock()

    # Gesture mapping from fingerSelector
    gesture_map = {}
    if fingerSelector:
        finger_names = ["Thumb", "Index", "Middle", "Ring", "Pinky"]
        for i, finger in enumerate(finger_names):
            if finger in fingerSelector:
                direction_str = fingerSelector[finger].get()
                gesture_map[i] = direction_str.upper()
    else:
        # Default mapping: Thumb=Left, Index=Right, Middle=Up, Ring=Down, Pinky=unused
        gesture_map = {0: "LEFT", 1: "RIGHT", 2: "UP", 3: "DOWN", 4: "NONE"}

    # Main game loop
    next_direction = direction
    last_gesture = [0, 0, 0, 0, 0]

    while True:
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return
            elif event.type == pygame.KEYDOWN:
                # Keep keyboard control as backup
                if event.key == pygame.K_UP and direction != "DOWN":
                    next_direction = "UP"
                elif event.key == pygame.K_DOWN and direction != "UP":
                    next_direction = "DOWN"
                elif event.key == pygame.K_LEFT and direction != "RIGHT":
                    next_direction = "LEFT"
                elif event.key == pygame.K_RIGHT and direction != "LEFT":
                    next_direction = "RIGHT"
                elif event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    return

        # Get gesture input from queue
        if gesture_queue:
            try:
                fingerList = gesture_queue.get_nowait()
                
                # Detect which finger was raised (look for changes)
                for i in range(5):
                    # Finger just raised (0 -> 1 transition)
                    if fingerList[i] == 1 and last_gesture[i] == 0:
                        new_dir = gesture_map.get(i, "NONE")
                        
                        # Prevent reversing direction
                        if new_dir == "UP" and direction != "DOWN":
                            next_direction = "UP"
                        elif new_dir == "DOWN" and direction != "UP":
                            next_direction = "DOWN"
                        elif new_dir == "LEFT" and direction != "RIGHT":
                            next_direction = "LEFT"
                        elif new_dir == "RIGHT" and direction != "LEFT":
                            next_direction = "RIGHT"
                
                last_gesture = fingerList
                
            except queue.Empty:
                pass  # No new gesture, keep current direction

        # Apply direction
        direction = next_direction

        # Snake movement logic
        x, y = snake_body[0]
        if direction == "UP":
            y -= CELL_SIZE
        elif direction == "DOWN":
            y += CELL_SIZE
        elif direction == "LEFT":
            x -= CELL_SIZE
        elif direction == "RIGHT":
            x += CELL_SIZE
        new_head = (x, y)

        # Collision checking 
        if (x < 0 or x >= WIDTH or y < 0 or y >= HEIGHT or new_head in snake_body):
            # GAME OVER 
            font = pygame.font.Font(None, 74)
            text = font.render("GAME OVER", True, WHITE)
            text_rect = text.get_rect(center=(WIDTH // 2, HEIGHT // 2))
            screen.blit(text, text_rect)
            pygame.display.flip()
            pygame.time.wait(2000)
            pygame.quit()
            return

        # Food checking 
        if new_head == food:
            food = None 
            while food is None:
                fx = random.randrange(0, WIDTH // CELL_SIZE) * CELL_SIZE
                fy = random.randrange(0, HEIGHT // CELL_SIZE) * CELL_SIZE
                if (fx, fy) in snake_body:
                    continue 
                else: 
                    food = (fx, fy)
        else:
            snake_body.pop()  # Remove tail

        # Add new head 
        snake_body.insert(0, new_head)

        # Draw game
        screen.fill(BLACK)
        for block in snake_body:
            pygame.draw.rect(screen, GREEN, (*block, CELL_SIZE, CELL_SIZE))
        pygame.draw.rect(screen, RED, (*food, CELL_SIZE, CELL_SIZE))
        
        # Draw score
        font = pygame.font.Font(None, 36)
        score_text = font.render(f"Score: {len(snake_body) - 3}", True, WHITE)
        screen.blit(score_text, (10, 10))
        
        pygame.display.flip()
        clock.tick(FPS)
