# Bits-And-Atoms

This is a Hackathon project done for nwHacks 2018.

Our demo project integrates various peripherals and languages/frameworks to connect the world of bits with the world of atoms.
The work consists of two applications:
1. Application to control an IoT device (Raspberry Pi) by communicating through AWS IoT
    - written in Python 3
    - collects motion sensor data
    - captures camera image
    - turns on an LED
    - makes noise on a buzzer
2. Application to use a VR and LeapMotion to control the IoT device located in a remote network.
    - back-end in Node.js
    - front-end in AngularJS
    - Relies on a local LeapMotion service (the same machine running the client-side app)
    - renders IoT device status inside the VR space
    - controls the LED and buzzer within the VR space through LeapMotion interaction

Using the user-facing application, we can use our hands to touch a button in the virtual space to turn on an LED and a buzzer in a remote network. We also receive a textual alert message within the virtual space when a motion is detected on the IoT device. We can also see a (rather slow) video stream coming from the IoT device.

<img src="https://raw.githubusercontent.com/Kanac/NWHacks-2018-Bits-And-Atoms/master/screenshot.png" alt="Screenshot" width="427" height="240" border="10"/>
