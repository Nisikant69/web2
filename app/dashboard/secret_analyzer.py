import sys
import time

# This script prints 1 to 1000
# flush=True ensures the output is sent to the terminal immediately
print("--- STARTING COUNT ---", flush=True)

for i in range(1, 1001):
    print(f"Count: {i}", flush=True)
    # Optional: slight delay if you want to see it scrolling visually
    # time.sleep(0.001) 

print("--- FINISHED COUNT ---", flush=True)