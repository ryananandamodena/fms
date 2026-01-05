package utils

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
	"strings"
)

// EmailConfig - Konfigurasi SMTP
type EmailConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
	FromName string
}

// GetEmailConfig - Ambil konfigurasi dari environment
func GetEmailConfig() EmailConfig {
	return EmailConfig{
		Host:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		Port:     getEnv("SMTP_PORT", "587"),
		Username: getEnv("SMTP_USERNAME", ""),
		Password: getEnv("SMTP_PASSWORD", ""),
		From:     getEnv("SMTP_FROM", "noreply@modena.com"),
		FromName: getEnv("SMTP_FROM_NAME", "FMS Modena"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// ApprovalEmailData - Data untuk email approval
type ApprovalEmailData struct {
	RecipientName   string
	RecipientRole   string
	Module          string
	ModuleLabel     string
	RequestNo       string
	RequestTitle    string
	RequesterName   string
	RequesterDept   string
	RequesterBranch string
	RequestDate     string
	ActionURL       string
	Details         map[string]string
	AppURL          string
}

// SendApprovalRequestEmail - Kirim email permintaan approval
func SendApprovalRequestEmail(data ApprovalEmailData, recipientEmail string) error {
	config := GetEmailConfig()
	
	if config.Username == "" || config.Password == "" {
		log.Println("SMTP not configured, skipping email send")
		return nil
	}

	subject := fmt.Sprintf("[FMS] Permintaan Approval %s - %s", data.ModuleLabel, data.RequestNo)
	
	body, err := renderApprovalRequestTemplate(data)
	if err != nil {
		return err
	}

	return sendEmail(config, recipientEmail, subject, body)
}

// SendApprovalResultEmail - Kirim email hasil approval
func SendApprovalResultEmail(data ApprovalEmailData, recipientEmail string, status string, comment string) error {
	config := GetEmailConfig()
	
	if config.Username == "" || config.Password == "" {
		log.Println("SMTP not configured, skipping email send")
		return nil
	}

	statusLabel := "Disetujui"
	if status == "Rejected" {
		statusLabel = "Ditolak"
	} else if status == "Revised" {
		statusLabel = "Perlu Revisi"
	}

	subject := fmt.Sprintf("[FMS] %s %s - %s", data.ModuleLabel, statusLabel, data.RequestNo)
	
	body, err := renderApprovalResultTemplate(data, status, statusLabel, comment)
	if err != nil {
		return err
	}

	return sendEmail(config, recipientEmail, subject, body)
}

func sendEmail(config EmailConfig, to, subject, body string) error {
	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", config.FromName, config.From)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	var msg bytes.Buffer
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(body)

	addr := fmt.Sprintf("%s:%s", config.Host, config.Port)
	err := smtp.SendMail(addr, auth, config.From, []string{to}, msg.Bytes())
	if err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
		return err
	}

	log.Printf("Email sent successfully to %s", to)
	return nil
}

func renderApprovalRequestTemplate(data ApprovalEmailData) (string, error) {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .header p { margin: 10px 0 0; opacity: 0.8; font-size: 14px; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .info-box { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-pending { background: #fff3cd; color: #856404; }
        .btn { display: inline-block; padding: 14px 32px; background: #1a1a1a; color: #fff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; }
        .btn:hover { background: #333; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
        .module-badge { background: #e3f2fd; color: #1565c0; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PERMINTAAN APPROVAL</h1>
            <p>Facility Management System</p>
        </div>
        <div class="content">
            <p class="greeting">Halo <strong>{{.RecipientName}}</strong>,</p>
            <p>Anda memiliki permintaan approval baru yang memerlukan tindakan Anda:</p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Modul</span>
                    <span class="module-badge">{{.ModuleLabel}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">No. Request</span>
                    <span class="info-value">{{.RequestNo}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Judul</span>
                    <span class="info-value">{{.RequestTitle}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Pemohon</span>
                    <span class="info-value">{{.RequesterName}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Departemen</span>
                    <span class="info-value">{{.RequesterDept}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cabang</span>
                    <span class="info-value">{{.RequesterBranch}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tanggal Request</span>
                    <span class="info-value">{{.RequestDate}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="badge badge-pending">Menunggu Approval</span>
                </div>
            </div>

            <p>Silakan klik tombol di bawah untuk melihat detail dan melakukan approval:</p>
            
            <center>
                <a href="{{.ActionURL}}" class="btn">LIHAT & PROSES APPROVAL</a>
            </center>
        </div>
        <div class="footer">
            <p>Email ini dikirim otomatis oleh sistem FMS Modena.<br>Mohon tidak membalas email ini.</p>
            <p>&copy; 2024 PT Modena Indonesia. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	t, err := template.New("approval_request").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func renderApprovalResultTemplate(data ApprovalEmailData, status, statusLabel, comment string) (string, error) {
	statusColor := "#28a745"
	statusBg := "#d4edda"
	if status == "Rejected" {
		statusColor = "#dc3545"
		statusBg = "#f8d7da"
	} else if status == "Revised" {
		statusColor = "#ffc107"
		statusBg = "#fff3cd"
	}

	tmplData := struct {
		ApprovalEmailData
		Status      string
		StatusLabel string
		StatusColor string
		StatusBg    string
		Comment     string
	}{
		ApprovalEmailData: data,
		Status:            status,
		StatusLabel:       statusLabel,
		StatusColor:       statusColor,
		StatusBg:          statusBg,
		Comment:           comment,
	}

	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .content { padding: 30px; }
        .status-box { background: {{.StatusBg}}; border-left: 4px solid {{.StatusColor}}; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status-box h2 { margin: 0 0 10px; color: {{.StatusColor}}; font-size: 18px; }
        .info-box { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #666; font-size: 12px; text-transform: uppercase; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .comment-box { background: #fff3cd; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .comment-box p { margin: 0; font-style: italic; }
        .btn { display: inline-block; padding: 14px 32px; background: #1a1a1a; color: #fff !important; text-decoration: none; border-radius: 12px; font-weight: 700; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HASIL APPROVAL</h1>
        </div>
        <div class="content">
            <p>Halo <strong>{{.RequesterName}}</strong>,</p>
            
            <div class="status-box">
                <h2>{{.StatusLabel}}</h2>
                <p>Permintaan {{.ModuleLabel}} Anda telah diproses.</p>
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">No. Request</span>
                    <span class="info-value">{{.RequestNo}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Judul</span>
                    <span class="info-value">{{.RequestTitle}}</span>
                </div>
            </div>

            {{if .Comment}}
            <div class="comment-box">
                <strong>Catatan:</strong>
                <p>"{{.Comment}}"</p>
            </div>
            {{end}}

            <center>
                <a href="{{.ActionURL}}" class="btn">LIHAT DETAIL</a>
            </center>
        </div>
        <div class="footer">
            <p>&copy; 2024 PT Modena Indonesia</p>
        </div>
    </div>
</body>
</html>
`
	// Replace template variables for status colors
	tmpl = strings.ReplaceAll(tmpl, "{{.StatusBg}}", tmplData.StatusBg)
	tmpl = strings.ReplaceAll(tmpl, "{{.StatusColor}}", tmplData.StatusColor)

	t, err := template.New("approval_result").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, tmplData); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// GetModuleLabel - Mendapatkan label modul dalam bahasa Indonesia
func GetModuleLabel(module string) string {
	labels := map[string]string{
		"VEHICLE":      "Kendaraan",
		"BUILDING":     "Gedung",
		"TAX_KIR":      "Pajak & KIR",
		"SERVICE":      "Servis Kendaraan",
		"MUTATION":     "Mutasi Aset",
		"SALES":        "Penjualan Aset",
		"CONTRACT":     "Kontrak Kendaraan",
		"POD":          "Permintaan POD",
		"LOKER":        "Permintaan Loker",
		"ATK":          "Permintaan ATK",
		"MAINTENANCE":  "Pemeliharaan",
		"INSURANCE":    "Asuransi",
		"BUILDING_ASSET": "Aset Gedung",
	}
	if label, ok := labels[module]; ok {
		return label
	}
	return module
}
