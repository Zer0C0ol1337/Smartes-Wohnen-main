import mysql.connector

# Verbindung herstellen
try:
    connection = mysql.connector.connect(
        host="localhost",
        user="dave",
        password="topstar14",
        database="smart_fridge"
    )
    if connection.is_connected():
        print("Verbindung erfolgreich hergestellt.")
        cursor = connection.cursor()

        # Testanfrage senden
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print("Testanfrage erfolgreich. Ergebnis:", result)

        # Verbindung schließen
        cursor.close()
        connection.close()
        print("Verbindung geschlossen.")
    else:
        print("Verbindung fehlgeschlagen.")
except mysql.connector.Error as error:
    print("Fehler bei der Verbindung:", error)
