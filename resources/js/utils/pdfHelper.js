/**
 * Utility to strip HTML tags for react-pdf compatibility
 * Since react-pdf doesn't support HTML rendering directly.
 */
export const stripHtml = (html) => {
    if (!html) return "";
    
    // Replace <br> and </p> with newlines
    let text = html.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n");
    text = text.replace(/<li>/gi, "• ");
    text = text.replace(/<\/li>/gi, "\n");
    
    // Remove all other tags
    text = text.replace(/<[^>]+>/g, "");
    
    // Decode entities
    const entities = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    
    Object.keys(entities).forEach(entity => {
        text = text.replace(new RegExp(entity, 'g'), entities[entity]);
    });

    return text.trim();
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount || 0);
};
