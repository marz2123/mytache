// Module de logging centralisé avec timestamps
// Utilisé pour faciliter le diagnostic sur Railway

function logWithTimestamp(level, message, error = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (error) {
    console.error(logMessage, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  } else {
    if (level === 'ERROR') {
      console.error(logMessage);
    } else if (level === 'WARN') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }
}

module.exports = {
  log: (message) => logWithTimestamp('INFO', message),
  error: (message, err = null) => logWithTimestamp('ERROR', message, err),
  warn: (message) => logWithTimestamp('WARN', message),
  info: (message) => logWithTimestamp('INFO', message)
};


