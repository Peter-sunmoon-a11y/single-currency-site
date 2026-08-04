import { mqtt_options } from "@/contexts/mqtt/context";
import type { MqttClient } from "@/contexts/mqtt/types";

type MqttConnectionConfig = {
  host: string;
  pass: string;
  user: string;
};

type MqttBrowserGlobal = {
  connect: (url: string, opts: typeof mqtt_options) => MqttClient;
};

declare global {
  interface Window {
    mqtt?: MqttBrowserGlobal;
  }
}

let mqttScriptPromise: Promise<MqttBrowserGlobal> | null = null;

const loadMqtt = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MQTT can only be loaded in the browser"));
  }

  if (window.mqtt) return Promise.resolve(window.mqtt);
  if (mqttScriptPromise) return mqttScriptPromise;

  mqttScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "/vendor/mqtt";
    script.onload = () => {
      if (window.mqtt) {
        resolve(window.mqtt);
        return;
      }
      mqttScriptPromise = null;
      reject(new Error("MQTT script loaded without exposing window.mqtt"));
    };
    script.onerror = () => {
      mqttScriptPromise = null;
      reject(new Error("Failed to load MQTT script"));
    };
    document.head.appendChild(script);
  });

  return mqttScriptPromise;
};

export const createMqttClient = async ({ host, pass, user }: MqttConnectionConfig) => {
  const mqtt = await loadMqtt();

  return mqtt.connect(`wss://${host}/mqtt`, {
    ...mqtt_options,
    username: user,
    password: pass,
  });
};
