##############################################################
#Dieses File dient dazu die Temperatur vom Arduino auszulesen#
##############################################################

import serial
import time

# Port auswählen, in meinem Fall ist es der PORT COM3, kann aber auch jeder andere sein.(Bitte Prüfen, falls Gerät nicht erreichbar)
ser = serial.Serial('COM3', 9600, timeout=1)

# Hier hab ich einfach mal eine Sleep funktion einbaut um den Arduino Zeit zu geben, sich zu verbinden
time.sleep(2)

try:
    while True:
        # Befehl zum Anfordern der Temperatur vom Arduino
        ser.write(b'Request_Temperature\n')

        # Antwort vom Arduino, wenn keine Antwort, verbindung Prüfen
        temperature = ser.readline().decode().strip()

        # Wenn alles richtig geladen hat, müsste eine Temperatur angezeigt werden
        if temperature.startswith('temp:'):
            # Hier mache ich eine spezifische Abfrage , da ich nur die Temeperatur haben möchte im richtigen Format
            temperature_value = float(temperature.split(':')[1])
            print("Temperatur: {} °C".format(temperature_value))
        else:
            print("Ungültige Antwort erhalten:", temperature)

        # ich habe ich eine erneute Sleep Funktion eingebaut so das ich alle 2 Sekunden eine eine Neue Temperatur angezigt bekomme.
        time.sleep(2)

except KeyboardInterrupt:
    # Wenn ich das Program beende , möchte ich das die Verbindung zum Arduino geschlossen wird.
    ser.close()
    print("Verbindung geschlossen.")
