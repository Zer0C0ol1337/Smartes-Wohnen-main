import serial
import logging
from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
from pydantic import BaseModel
import mysql.connector

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Arduino Schnittstelle
SERIAL_PORT = 'COM3'
SERIAL_BAUDRATE = 9600
TIMEOUT = 1

# Versuch der Verbindung herzustellen zum Arduino
try:
    ser = serial.Serial(SERIAL_PORT, SERIAL_BAUDRATE, timeout=TIMEOUT)
    logging.info('Serial connection established on %s at %s baud rate', SERIAL_PORT, SERIAL_BAUDRATE)
except serial.SerialException as e:
    ser = None
    logging.error('Failed to open serial port: %s', e)

# Meine Request um daten vom Arduino zu bekommen
def get_temperature():
    if ser is None:
        logging.warning('Serial connection not available')
        return {'error': 'Serial connection not available'}

    try:
        ser.write(b'Request_Temperature')
        temperature_response = ser.readline().decode().strip()
        print(f"Received from Arduino: {temperature_response}") 
        if temperature_response:
            # Split the response at the colon and take the second part
            temperature = temperature_response.split(':')[1]
            return {'temperature': temperature}
        else:
            return {'error': 'Failed to retrieve temperature'}
    except Exception as e:
        logging.error('Failed to retrieve temperature: %s', e)
        return {'error': 'Failed to retrieve temperature'}

# Meine SQL Login Daten
MYSQL_HOST = 'xxx'
MYSQL_USER = 'xxx'
MYSQL_PASSWORD = 'xxx'
MYSQL_DATABASE = 'xxx'

# MYSQL Verbindung herstellen wenn möglich
def get_mysql_connection():
    try:
        cnx = mysql.connector.connect(user=MYSQL_USER, password=MYSQL_PASSWORD,
                                      host=MYSQL_HOST, database=MYSQL_DATABASE)
        return cnx
    except mysql.connector.Error as err:
        logging.error('Failed to connect to MySQL: %s', err)
        return None

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/icons", StaticFiles(directory="icons"), name="icons")

# Funktion um Produkte in die Datenbank einzufügen
def add_product_to_db(product_name, quantity):
    cnx = get_mysql_connection()
    if cnx is None:
        return False

    cursor = cnx.cursor()
    add_product_query = ("INSERT INTO ist "
                         "(product_name, quantity) "
                         "VALUES (%s, %s)")
    product_data = (product_name, quantity)

    try:
        cursor.execute(add_product_query, product_data)
        cnx.commit()
        cursor.close()
        cnx.close()
        return True
    except mysql.connector.Error as err:
        logging.error('Failed to insert product into database: %s', err)
        return False

class Product(BaseModel):
    product_name: str
    quantity: int

# Temperature API
@app.get("/get_temperature")
async def get_temperature_api():
    temperature = get_temperature()
    if 'temperature' in temperature:
        return {"temperature": temperature['temperature']}
    else:
        return {"error": "Failed to retrieve temperature"}

# Produkt hinzufügen API
@app.post("/add_product")
async def add_product(product: Product):
    success = add_product_to_db(product.product_name, product.quantity)
    if success:
        return {"status": "Product added successfully"}
    else:
        return {"error": "Failed to add product"}

# Funktion um zu prüfen ob die Zutaten für ein Rezept vorhanden sind
# Aktuell nur für Spaghetti mit Tomatensoße
# Zutaten für Rezept prüfen API
@app.get("/checkIngredients/{recipe}")
async def check_ingredients(recipe: str):
    cnx = get_mysql_connection()
    if cnx is None:
        return {"error": "Failed to connect to MySQL"}

    cursor = cnx.cursor()

    if recipe == 'Spaghetti mit Tomatensoße':
        ingredients = ['Spaghetti', 'Tomatensoße']
    else:
        return {"error": "Unbekanntes Rezept"}
    
    missing_ingredients = []
    for ingredient in ingredients:
        cursor.execute('SELECT * FROM ist WHERE product_name = %s', (ingredient,))
        result = cursor.fetchone()
        if not result:
            missing_ingredients.append(ingredient)
    
    cursor.close()
    cnx.close()

    if missing_ingredients:
        return {"status": "rot", "missing_ingredients": missing_ingredients}
    else:
        return {"status": "grün"}

#Produkte anzeigen API
@app.get("/get_products")
async def get_products():
    cnx = get_mysql_connection()
    if cnx is None:
        return {"error": "Failed to connect to MySQL"}

    cursor = cnx.cursor(dictionary=True)
    query = "SELECT * FROM ist"
    cursor.execute(query)
    products = cursor.fetchall()
    cursor.close()
    cnx.close()

    return {"products": products}

#Produkte entfernen API
@app.delete("/delete_product/{product_name}")
async def delete_product(product_name: str):
    cnx = get_mysql_connection()
    if cnx is None:
        return {"error": "Failed to connect to MySQL"}

    cursor = cnx.cursor()
    query = "DELETE FROM ist WHERE product_name = %s"
    cursor.execute(query, (product_name,))
    cnx.commit()
    cursor.close()
    cnx.close()

    return {"status": "Product deleted successfully"}


# Webserver starten
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
