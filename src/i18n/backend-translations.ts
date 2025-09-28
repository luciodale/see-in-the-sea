export const defaultLang = 'en';
export const languages = {
  en: 'English',
  it: 'Italiano',
} as const;

export type Language = keyof typeof languages;

export const backendTranslations = {
  en: {
    // Generic errors
    'error.server-configuration': 'Server configuration error',
    'error.database-unavailable': 'Database not available',
    'error.internal-server': 'Internal server error',
    'error.storage-unavailable': 'Storage or database unavailable',
    'error.webhook-processing-failed': 'Webhook processing failed',

    // Authentication errors
    'error.access-denied-admin': 'Access denied. Admin role required for admin uploads.',
    'error.access-denied-admin-delete': 'Access denied. Admin role required for admin delete.',
    'error.insufficient-permissions': 'INSUFFICIENT_PERMISSIONS',

    // Validation errors
    'error.missing-required-data': 'Missing required data',
    'error.missing-stripe-signature': 'Missing stripe-signature header',
    'error.invalid-signature': 'Invalid signature',
    'error.submission-id-required': 'submissionId is required',
    'error.contest-id-required': 'contestId is required',
    'error.result-id-required': 'Missing resultId or result',
    'error.contest-id-missing': 'Missing contest id',
    'error.no-fields-to-update': 'No fields to update',
    'error.user-email-required': 'User email is required for admin uploads.',
    'error.image-key-required': 'Image key required',
    'error.invalid-image-url-format': 'Invalid image URL format',

    // Contest and submission errors
    'error.no-active-contest': 'No active contest found',
    'error.contest-not-found': 'Contest not found or inactive.',
    'error.category-invalid': 'Invalid or inactive category.',
    'error.submissions-closed': 'Submissions are closed for this contest.',
    'error.submissions-locked': 'You cannot modify your submissions after payment has been completed.',
    'error.need-submission-to-pay': 'You need to submit to at least one category to be able to pay.',

    // Image and file errors
    'error.image-not-found': 'Image not found',
    'error.image-not-found-storage': 'Image not found in storage',
    'error.r2-not-configured': 'R2 bucket not configured',
    'error.server-config-missing': 'Server configuration error: Missing R2 bucket or database.',

    // Submission errors
    'error.submission-not-found': 'Submission not found',
    'error.submission-not-owned': 'Submission not found or not owned by user',
    'error.creating-submissions-without-images': 'Creating new submissions without images is not supported. Use the upload-image endpoint instead.',

    // Generic operation errors
    'error.failed-to-fetch-submissions': 'Failed to fetch submissions',
    'error.failed-to-manage-submission': 'Failed to manage submission',
    'error.failed-to-create-contest': 'Failed to create contest',
    'error.failed-to-upload-image': 'Failed to upload image',
    'error.failed-to-delete-submission': 'Failed to delete submission',
    'error.failed-to-fetch-contest-categories': 'Failed to fetch contest and categories',
    'error.failed-to-check-payment-status': 'Failed to check payment status',
    'error.failed-to-fetch-judges': 'Failed to fetch judges',

    // Success messages
    'success.contest-created': 'Contest created successfully!',
    'success.submission-deleted': 'Submission deleted',
    'success.image-uploaded': 'Image uploaded successfully!',
  },

  it: {
    // Generic errors
    'error.server-configuration': 'Errore di configurazione del server',
    'error.database-unavailable': 'Database non disponibile',
    'error.internal-server': 'Errore interno del server',
    'error.storage-unavailable': 'Storage o database non disponibile',
    'error.webhook-processing-failed': 'Elaborazione webhook fallita',

    // Authentication errors
    'error.access-denied-admin': 'Accesso negato. Ruolo admin richiesto per caricamenti admin.',
    'error.access-denied-admin-delete': 'Accesso negato. Ruolo admin richiesto per eliminazione admin.',
    'error.insufficient-permissions': 'INSUFFICIENT_PERMISSIONS',

    // Validation errors
    'error.missing-required-data': 'Dati richiesti mancanti',
    'error.missing-stripe-signature': 'Header stripe-signature mancante',
    'error.invalid-signature': 'Firma non valida',
    'error.submission-id-required': 'submissionId è richiesto',
    'error.contest-id-required': 'contestId è richiesto',
    'error.result-id-required': 'resultId o result mancanti',
    'error.contest-id-missing': 'Id contest mancante',
    'error.no-fields-to-update': 'Nessun campo da aggiornare',
    'error.user-email-required': 'Email utente richiesta per caricamenti admin.',
    'error.image-key-required': 'Chiave immagine richiesta',
    'error.invalid-image-url-format': 'Formato URL immagine non valido',

    // Contest and submission errors
    'error.no-active-contest': 'Nessun contest attivo trovato',
    'error.contest-not-found': 'Contest non trovato o inattivo.',
    'error.category-invalid': 'Categoria non valida o inattiva.',
    'error.submissions-closed': 'Le candidature sono chiuse per questo contest.',
    'error.submissions-locked': 'Non puoi modificare le tue candidature dopo aver completato il pagamento.',
    'error.need-submission-to-pay': 'Devi candidarti ad almeno una categoria per poter pagare.',

    // Image and file errors
    'error.image-not-found': 'Immagine non trovata',
    'error.image-not-found-storage': 'Immagine non trovata nello storage',
    'error.r2-not-configured': 'Bucket R2 non configurato',
    'error.server-config-missing': 'Errore di configurazione del server: Bucket R2 o database mancanti.',

    // Submission errors
    'error.submission-not-found': 'Candidatura non trovata',
    'error.submission-not-owned': 'Candidatura non trovata o non di proprietà dell\'utente',
    'error.creating-submissions-without-images': 'La creazione di candidature senza immagini non è supportata. Usa l\'endpoint upload-image invece.',

    // Generic operation errors
    'error.failed-to-fetch-submissions': 'Recupero candidature fallito',
    'error.failed-to-manage-submission': 'Gestione candidatura fallita',
    'error.failed-to-create-contest': 'Creazione contest fallita',
    'error.failed-to-upload-image': 'Caricamento immagine fallito',
    'error.failed-to-delete-submission': 'Eliminazione candidatura fallita',
    'error.failed-to-fetch-contest-categories': 'Recupero contest e categorie fallito',
    'error.failed-to-check-payment-status': 'Controllo stato pagamento fallito',
    'error.failed-to-fetch-judges': 'Recupero giudici fallito',

    // Success messages
    'success.contest-created': 'Contest creato con successo!',
    'success.submission-deleted': 'Candidatura eliminata',
    'success.image-uploaded': 'Immagine caricata con successo!',
  },
} as const;

export type BackendTranslationKey = keyof (typeof backendTranslations)[typeof defaultLang];
