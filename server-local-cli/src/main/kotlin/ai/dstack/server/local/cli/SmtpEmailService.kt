package ai.dstack.server.local.cli

import ai.dstack.server.model.User
import ai.dstack.server.services.AppConfig
import ai.dstack.server.services.EmailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Component
import java.util.*

@Component
class SmtpEmailService(@Autowired val config: AppConfig) : EmailService {

    var sender: JavaMailSender = getJavaMailSender()

    private fun getJavaMailSender(): JavaMailSender {
        val mailSender = JavaMailSenderImpl()
        mailSender.host = config.smtpHost!!
        mailSender.port = config.smtpPort!!
        config.smtpUser?.let {
            mailSender.username = it
        }
        config.smtpPassword?.let {
            mailSender.password = it
        }
        val props: Properties = mailSender.javaMailProperties
        props["mail.transport.protocol"] = "smtp"
        props["mail.smtp.auth"] = if (config.smtpUser != null && config.smtpPassword != null) "true" else "false"
        props["mail.smtp.starttls.enable"] = config.smtpStartTLS
        return mailSender
    }

    override fun sendVerificationEmail(user: User) {
        sendMessage(user.email!!,
            EmailService.verificationEmailSubject,
            EmailService.verificationEmailPlainText(user, config),
            EmailService.verificationEmailHtml(user, config)
        )
    }

    override fun sendResetEmail(user: User) {
        sendMessage(user.email!!,
            EmailService.resetEmailSubject,
            EmailService.resetEmailPlainText(user, config),
            EmailService.resetEmailHtml(user, config)
        )
    }

    override fun sendTriggerEmail(user: User) {
        sendMessage(user.email!!,
            EmailService.triggerEmailSubject,
            EmailService.triggerEmailPlainText(user, config),
            EmailService.triggerEmailHtml(user, config)
        )
    }

    override fun sendInviteEmail(fromUser: User, path: String, toEmail: String, verificationCode: String) {
        sendMessage(toEmail,
            EmailService.stackInviteEmailSubject(path),
            EmailService.stackInviteEmailPlainText(fromUser, toEmail, path, verificationCode, config),
            EmailService.stackInviteEmailHtml(fromUser, toEmail, path, verificationCode, config)
        )
    }

    override fun sendInviteEmail(fromUser: User, path: String, toUser: User) {
        sendMessage(toUser.email!!,
            EmailService.stackInviteEmailSubject(path),
            EmailService.stackInviteEmailPlainText(fromUser, toUser, path, config),
            EmailService.stackInviteEmailHtml(fromUser, toUser, path, config)
        )
    }

    override fun sendSupportRequestEmail(name: String?, email: String, company: String?, message: String) {
        sendMessage(config.adminEmail!!,
            EmailService.supportRequestEmailSubject(),
            EmailService.supportRequestEmailPlainText(name, email, company, message),
            EmailService.supportRequestEmailHtml(name, email, company, message),
            cc = email
        )
    }

    fun sendMessage(to: String, subject: String, plainText: String, html: String, cc: String? = null) {
        val message = sender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)
        helper.setReplyTo("no-reply@dstack.ai")
        helper.setFrom(config.smtpFrom!!)
        helper.setTo(to)
        if (cc != null) {
            helper.setCc(cc)
        }
        helper.setSubject(subject)
        helper.setText(plainText, html)
        sender.send(message)
    }
}