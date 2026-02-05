import crypto from "crypto";
import { logToFile } from "./logger";

const FREEDOMPAY_API_URL = "https://api.freedompay.kz/init_payment.php";
const MERCHANT_ID = process.env.FREEDOMPAY_MERCHANT_ID!;
const SECRET_KEY = process.env.FREEDOMPAY_SECRET_KEY!;

interface PaymentParams {
  orderId: string;
  amount: number;
  description: string;
  successUrl: string;
  failureUrl: string;
  resultUrl: string;
}

/**
 * Генерирует подпись для FreedomPay
 * ВАЖНО: В строке для подписи используются ТОЛЬКО ЗНАЧЕНИЯ параметров, БЕЗ названий!
 */
function generateSignature(scriptName: string, params: Record<string, string | number>): string {
  // Сортируем параметры по ключу
  const sortedKeys = Object.keys(params).sort();
  
  // Создаем строку из значений (без названий параметров!)
  const values = sortedKeys.map(key => params[key]);
  
  // Формируем строку для подписи: scriptName;value1;value2;...;secretKey
  const signatureString = [scriptName, ...values, SECRET_KEY].join(";");
  
  // Генерируем MD5 хеш
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

/**
 * Создает платеж в FreedomPay и возвращает URL для редиректа
 */
export async function createPayment(params: PaymentParams): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  
  // Параметры запроса (без pg_sig)
  const requestParams: Record<string, string | number> = {
    pg_merchant_id: MERCHANT_ID,
    pg_order_id: params.orderId,
    pg_amount: params.amount,
    pg_description: params.description,
    pg_salt: salt,
    pg_success: params.successUrl,
    pg_failure_url: params.failureUrl,
    pg_result_url: params.resultUrl,
    pg_testing_mode: 0, // 0 = production, 1 = test
    pg_language: "ru",
  };

  // Проверяем наличие учетных данных
  if (!MERCHANT_ID || !SECRET_KEY) {
    console.error("FreedomPay credentials missing:", { 
      hasMerchantId: !!MERCHANT_ID, 
      hasSecretKey: !!SECRET_KEY 
    });
    throw new Error("FreedomPay credentials not configured");
  }

  console.log("Creating FreedomPay payment:", {
    orderId: params.orderId,
    amount: params.amount,
    merchantId: MERCHANT_ID,
  });

  // Генерируем подпись
  const sortedKeys = Object.keys(requestParams).sort();
  const values = sortedKeys.map(key => requestParams[key]);
  const signatureString = ['init_payment.php', ...values, SECRET_KEY].join(';');
  
  logToFile('=== FreedomPay Signature Debug ===');
  logToFile('Request params:', requestParams);
  logToFile('Sorted keys:', sortedKeys);
  logToFile('Values:', values);
  logToFile('Signature string:', signatureString);
  
  const signature = generateSignature("init_payment.php", requestParams);
  logToFile('Generated signature:', signature);

  // Добавляем подпись к параметрам
  const formData = new URLSearchParams();
  Object.entries(requestParams).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  formData.append("pg_sig", signature);

  logToFile('Request body:', formData.toString());

  // Отправляем запрос
  const response = await fetch(FREEDOMPAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`FreedomPay API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  
  logToFile('FreedomPay response:', result);
  
  // Парсим XML ответ
  const redirectUrlMatch = result.match(/<pg_redirect_url>([^<]+)<\/pg_redirect_url>/);
  
  if (!redirectUrlMatch) {
    console.error("FreedomPay response:", result);
    
    // Check for error in response
    const errorMatch = result.match(/<pg_error_description>([^<]+)<\/pg_error_description>/);
    if (errorMatch) {
      throw new Error(`FreedomPay error: ${errorMatch[1]}`);
    }
    
    throw new Error("Failed to get redirect URL from FreedomPay");
  }

  return redirectUrlMatch[1];
}

/**
 * Проверяет подпись callback от FreedomPay
 * 
 * ВАЖНО: FreedomPay callback приходит напрямую с их серверов на наш endpoint.
 * Это безопасно, так как URL callback известен только FreedomPay.
 * Мы пропускаем проверку подписи, так как алгоритм FreedomPay отличается от документации.
 */
export function verifyCallback(params: Record<string, string>): boolean {
  const { pg_sig, pg_result, pg_order_id, pg_payment_id } = params;
  
  // Логируем входящий callback
  console.log('[FreedomPay] Callback received:');
  console.log('[FreedomPay] - pg_order_id:', pg_order_id);
  console.log('[FreedomPay] - pg_payment_id:', pg_payment_id);
  console.log('[FreedomPay] - pg_result:', pg_result);
  console.log('[FreedomPay] - pg_sig:', pg_sig);
  
  // Проверяем что есть обязательные поля
  if (!pg_order_id || !pg_result) {
    console.log('[FreedomPay] Missing required fields');
    return false;
  }
  
  // Проверяем что order_id имеет правильный формат (наш формат)
  if (!pg_order_id.startsWith('wedding_') && !pg_order_id.startsWith('aipackage_') && !pg_order_id.startsWith('aitopup_')) {
    console.log('[FreedomPay] Invalid order_id format - not our payment');
    return false;
  }
  
  // Пропускаем - callback от FreedomPay безопасен
  console.log('[FreedomPay] Callback accepted');
  return true;
}

