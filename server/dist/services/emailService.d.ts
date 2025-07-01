export interface EmailData {
    email: string;
    subject: string;
    template: string;
    data: Record<string, any>;
}
export declare const sendEmail: (emailData: EmailData) => Promise<boolean>;
export declare const sendBulkEmail: (emails: string[], template: string, data: Record<string, any>) => Promise<boolean>;
//# sourceMappingURL=emailService.d.ts.map