/**
 * Simple internal analytics layer.
 * Currently logs to console, but structured for future SDK integration.
 */
export const trackEvent = (name: string, payload: Record<string, any> = {}) => {
  const eventData = {
    name,
    timestamp: new Date().toISOString(),
    payload,
  };

  // Consistent JSON format for easy parsing/ingestion later
  console.log('📊 [Analytics]', JSON.stringify(eventData));
};
