#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==========================================
// CONFIGURACIÓN DE RED E INFRAESTRUCTURA
// ==========================================
const char* ssid     = "TU_WIFI_SSID";         // <-- Cambiar por la red del hotel/motel
const char* password = "TU_WIFI_PASSWORD";     // <-- Cambiar por la contraseña de la red
const char* mqtt_server = "hoteleria.com.co";   // Tu dominio unificado (Nginx/Mosquitto)
const int mqtt_port   = 1883;                  // Puerto expuesto de Mosquitto

// Variables Globales
WiFiClient espClient;
PubSubClient mqttClient(espClient);
String macAddress = "";
char cmdTopic[64];
char stateTopic[64];

// ==========================================
// HANDLER DE COMANDOS MQTT (CALLBACK)
// ==========================================
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Comando recibido en [");
    Serial.print(topic);
    Serial.println("]");

    // Parsear el JSON recibido de la API de NestJS
    // Payload esperado: {"pin": 13, "action": "on"}
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.print("Error parseando JSON: ");
        Serial.println(error.c_str());
        return;
    }

    int pin = doc["pin"];
    const char* action = doc["action"];

    if (action != NULL) {
        Serial.printf("Ejecutando: Pin %d -> %s\n", pin, action);
        
        // Configurar pin dinámicamente como salida por si no fue inicializado antes
        pinMode(pin, OUTPUT); 

        if (strcmp(action, "on") == 0) {
            digitalWrite(pin, HIGH);
            publishState(pin, "on");
        } else if (strcmp(action, "off") == 0) {
            digitalWrite(pin, LOW);
            publishState(pin, "off");
        }
    }
}

// ==========================================
// PUBLICACIÓN DE ESTADO REAL (FEEDBACK)
// ==========================================
void publishState(int pin, const char* state) {
    StaticJsonDocument<128> doc;
    doc["pin"] = pin;
    doc["state"] = state;
    doc["timestamp"] = millis();

    char payload[128];
    serializeJson(doc, payload);
    
    // Publica de vuelta al servidor para que NestJS actualice Redis
    mqttClient.publish(stateTopic, payload, true); 
}

// ==========================================
// CONEXIÓN Y LOGUEO (WIFI & MQTT)
// ==========================================
void setup_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Conectando a ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nWiFi Conectado Exitosamente");
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP());
}

void reconnect() {
    // Bucle hasta lograr la conexión
    while (!mqttClient.connected()) {
        Serial.print("Intentando conexión MQTT...");
        
        // Usar la dirección MAC como Client ID único en el broker MQTT
        if (mqttClient.connect(macAddress.c_str())) {
            Serial.println("Conectado al Broker Mosquitto");
            
            // Suscribirse al tópico de comandos de este ESP32 específico usando su MAC
            mqttClient.subscribe(cmdTopic);
            Serial.printf("Suscrito a: %s\n", cmdTopic);
            
            // Notificar anuncio de encendido (Auto-registro)
            StaticJsonDocument<128> doc;
            doc["macAddress"] = macAddress;
            doc["status"] = "online";
            char payload[128];
            serializeJson(doc, payload);
            mqttClient.publish("galaxypos/hardware/announcement", payload);
        } else {
            Serial.print("Falló conexión, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" Intentando de nuevo en 5 segundos...");
            delay(5000);
        }
    }
}

// ==========================================
// INICIALIZACIÓN PRINCIPAL
// ==========================================
void setup() {
    Serial.begin(115200);
    
    // 1. Obtener la dirección MAC e inicializar tópicos dinámicos
    macAddress = WiFi.macAddress();
    macAddress.toUpperCase(); // Estandarizar a mayúsculas
    
    snprintf(cmdTopic, sizeof(cmdTopic), "galaxypos/hardware/cmd/%s", macAddress.c_str());
    snprintf(stateTopic, sizeof(stateTopic), "galaxypos/hardware/state/%s", macAddress.c_str());

    Serial.printf("=== GALAXYPOS INITIALIZED ===\n");
    Serial.printf("DEVICE MAC ID: %s\n", macAddress.c_str());
    Serial.printf("=============================\n");

    // 2. Levantar Conexiones
    setup_wifi();
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(callback);
}

void loop() {
    if (!mqttClient.connected()) {
        reconnect();
    }
    mqttClient.loop();
}
