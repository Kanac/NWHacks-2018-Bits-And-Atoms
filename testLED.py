import RPi.GPIO as GPIO
import time

ledPin = 25    # pin22
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)       # GPIO Numbering of Pins
GPIO.setup(ledPin, GPIO.OUT)   # Set ledPin as output
GPIO.output(ledPin, GPIO.LOW)  # Set ledPin to LOW to turn Off the LED

while True:
    GPIO.output(ledPin, GPIO.HIGH)  # led on
    time.sleep(1)
    GPIO.output(ledPin, GPIO.LOW) # led off
    time.sleep(1)
