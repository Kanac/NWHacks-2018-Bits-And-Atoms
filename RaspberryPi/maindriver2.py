####################################
# University of British Columbia
# IoT Lab
# Jan 2018
#####################################
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import argparse
import json
import logging
import time
from picamera import PiCamera
import io, base64
import RPi.GPIO as GPIO

count = 0
buf = io.BytesIO()

parser = argparse.ArgumentParser()
parser.add_argument("-e", "--endpoint", action="store", required=True, dest="host", help="Your AWS IoT custom endpoint")
parser.add_argument("-r", "--rootCA", action="store", required=True, dest="rootCAPath", help="Root CA file path")
parser.add_argument("-c", "--cert", action="store", dest="certificatePath", help="Certificate file path")
parser.add_argument("-k", "--key", action="store", dest="privateKeyPath", help="Private key file path")
parser.add_argument("-w", "--websocket", action="store_true", dest="useWebsocket", default=False,
                    help="Use MQTT over WebSocket")
parser.add_argument("-id", "--clientId", action="store", dest="clientId", default="basicPubSub",
                    help="Targeted client id")
args = parser.parse_args()
host = args.host
rootCAPath = args.rootCAPath
certificatePath = args.certificatePath
privateKeyPath = args.privateKeyPath
useWebsocket = args.useWebsocket
clientId = "main"

if useWebsocket and certificatePath and privateKeyPath:
    parser.error("X.509 cert authentication and WebSocket are mutual exclusive. Please pick one.")
    exit(2)

if not useWebsocket and (not certificatePath or not privateKeyPath):
    parser.error("Missing credentials for authentication.")
    exit(2)


# ##################################
# ####### Configure logging ########
# ##################################
logger = logging.getLogger("AWSIoTPythonSDK.core")
logger.setLevel(logging.DEBUG)
streamHandler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
streamHandler.setFormatter(formatter)
logger.addHandler(streamHandler)


######################
# ## Init Camera #####
######################
#GPIO.setmode(GPIO.BOARD)
camera = PiCamera(resolution=(320, 240))

# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = None
if useWebsocket:
    myAWSIoTMQTTClient = AWSIoTMQTTClient(clientId, useWebsocket=True)
    myAWSIoTMQTTClient.configureEndpoint(host, 443)
    myAWSIoTMQTTClient.configureCredentials(rootCAPath)
else:
    myAWSIoTMQTTClient = AWSIoTMQTTClient(clientId)
    myAWSIoTMQTTClient.configureEndpoint(host, 8883)
    myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec


# ############################################
# ## Subscription and Callback assignments ###
# ## Connect and subscribe to AWS IoT ########
# ############################################
myAWSIoTMQTTClient.connect()
time.sleep(2)

while True:
    camera.capture(buf, format='jpeg')
    count=count+1
    print (count)
    bstr = base64.b64encode(buf.getvalue())
    #print(bstr)
    print "lenth is:====>"
    print (len(bstr))
    
    myAWSIoTMQTTClient.publishAsync("sensor/camera/image",
    json.dumps({"image":bstr}), 1)
    buf.close()
    buf = io.BytesIO()

# print(bstr)
# print(buf.read())
# print(buf.getvalue())


# EoF
