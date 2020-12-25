package ai.dstack.server.services

import ai.dstack.server.model.User
import java.net.URLEncoder

interface EmailService {
    fun sendVerificationEmail(user: User)
    fun sendResetEmail(user: User)
    fun sendTriggerEmail(user: User)
    fun sendInviteEmail(fromUser: User, path: String, toEmail: String, verificationCode: String)
    fun sendInviteEmail(fromUser: User, path: String, toUser: User)
    fun sendSupportRequestEmail(name: String?, email: String, company: String?, message: String)

    companion object {
        const val verificationEmailSubject = "[dstack.ai] Verify your email address"

        fun verificationEmailHtml(user: User, config: AppConfig): String {
            val name = user.name.substringBefore("?")
            return """<p>Hello, $name!<p/>
                |
                |
                |<p>Welcome to dstack.ai! Please follow this link to verify your account:<p/>
                |
                |<p><a href="${config.address}/auth/verify?user=$name&code=${user.verificationCode}">${config.address}/auth/verify?user=$name&code=${user.verificationCode}</a><p/>
                |
                |<p>If you have any problems, please contact write us at <a href="mailto:team@dstack.ai">team@dstack.ai</a>.<p/>
                |
                |<p><i>The dstack.ai Team</i></p>""".trimMargin()
        }

        fun verificationEmailPlainText(user: User, config: AppConfig): String {
            val name = user.name.substringBefore("?")
            return """Hello, $name!
                |
                |Welcome to dstack.ai! Please follow this link to verify your account:
                |
                |${config.address}/auth/verify?user=$name&code=${user.verificationCode}
                |
                |If you have any problems, please contact write us at team@dstack.ai.
                |
                |The dstack.ai Team""".trimMargin()
        }

        private fun settingsLink(user: User, config: AppConfig) =
            "${config.address}/auth/verify?user=${user.name}&code=${user.verificationCode}&next=/settings"

        const val resetEmailSubject = "[dstack.ai] Reset your password"

        fun resetEmailPlainText(user: User, config: AppConfig): String {
            val name = user.name
            return """Hello, $name!
                |
                |We received a request to reset your password. To reset your password, please follow this url:
                |
                |${config.address}/auth/reset-password?email=${URLEncoder.encode(
                user.email!!,
                "UTF-8"
            )}&code=${user.verificationCode}
                |
                |If you did not make this request, just ignore this email.
                |
                |The dstack.ai Team""".trimMargin()
        }

        fun resetEmailHtml(user: User, config: AppConfig): String {
            val name = user.name
            return """<p>Hello, $name!<p/>
                |
                |<p>We received a request to reset your password. To reset your password, please follow this url:<p/>
                |
                |<p><a href="${config.address}/auth/reset-password?email=${URLEncoder.encode(
                user.email!!,
                "UTF-8"
            )}&code=${user.verificationCode}">${config.address}/auth/reset-password?email=${URLEncoder.encode(
                user.email,
                "utf-8"
            )}&code=${user.verificationCode}</a><p/>
                |
                |<p>If you did not make this request, just ignore this email.<p/>
                |
                |<p><i>The dstack.ai Team</i></p>""".trimMargin()
        }

        const val triggerEmailSubject = """👋 Hi from Andrey, a dstack.ai co-founder"""

        fun triggerEmailPlainText(user: User, config: AppConfig): String {
            return """Hi, I'm Andrey and I’m a co-founder of dstack.ai. Just wanna thank you for trying dstack.ai and make sure that your experience with it has been straightforward and enjoyable!
                                                |
                                                |Did everything work well? Have you found dstack.ai helpful for yourself and your team?
                                                |
                                                |If you have a spare minute, please share your feedback with me 🙏: https://forms.gle/Sa4QirK6eJb9eRWE8
                                                |
                                                |Join us in the future 🚀
                                                |Andrey | Co-founder
                                                |
                                                |You can opt-out from all dstack.ai emails in your settings: ${settingsLink(
                user,
                config
            )}""".trimMargin()
        }

        fun triggerEmailHtml(user: User, config: AppConfig): String {
            return """<p>Hi, I'm Andrey and I’m a co-founder of <a href="https://dstack.ai">dstack.ai</a>. Just wanna thank you for trying <a href="https://dstack.ai">dstack.ai</a> and make sure that your experience with it has been straightforward and enjoyable!</p>
                |
                |<p>Did everything work well? Have you found <a href="https://dstack.ai">dstack.ai</a> helpful for yourself and your team?</p>
                |
                |<p>If you have a spare minute, please <a href="https://forms.gle/Sa4QirK6eJb9eRWE8">share</a> your feedback with me 🙏.</p>
                |
                |<p><i>Join us in the future 🚀<br/>
                |Andrey | Co-founder</i></p>
                |
                |<p style="color:#979197">You can opt-out from all dstack.ai emails in your <a href="${settingsLink(
                user,
                config
            )}">settings</a> but you'll miss product updates!</p>""".trimMargin()
        }

        fun stackInviteEmailSubject(path: String) = "[dstack.ai] Invitation to '$path'"

        fun stackInviteEmailPlainText(
            fromUser: User,
            toEmail: String,
            path: String,
            verificationCode: String,
            config: AppConfig
        ): String {
            val encodedEmail = URLEncoder.encode(toEmail, "UTF-8")
            // TODO: cLeanup
            return """Hello,
                |
                |The user ${fromUser.name} has invited you to see the '$path' stack. To see the stack, please follow this personal registration url:
                | 
                |${config.address}/auth/signup?email=${encodedEmail}&code=${verificationCode}
                |
                |The dstack.ai Team""".trimMargin()
        }

        fun stackInviteEmailHtml(
            fromUser: User,
            toEmail: String,
            path: String,
            verificationCode: String,
            config: AppConfig
        ): String {
            val encodedEmail = URLEncoder.encode(toEmail, "UTF-8")
            // TODO: cLeanup
            return """<p>Hello,
                |
                |<p>The user ${fromUser.name} has invited you to see the '$path' stack. To see the stack, please follow this personal registration url:</p>
                | 
                |<p><a href="${config.address}/auth/signup?email=${encodedEmail}&code=${verificationCode}">${config.address}/auth/signup?email=${encodedEmail}&code=${verificationCode}</a></p>
                |
                |<p><i>The dstack.ai Team</i></p>""".trimMargin()
        }

        fun stackInviteEmailPlainText(
            fromUser: User,
            toUser: User,
            path: String,
            config: AppConfig
        ): String {
            return """Hello, ${toUser.name}!
                |
                |The user ${fromUser.name} has invited you to see the '$path' stack. To see the stack, please follow this url:
                | 
                |${config.address}/$path
                |
                |The dstack.ai Team""".trimMargin()
        }

        fun stackInviteEmailHtml(
            fromUser: User,
            toUser: User,
            path: String,
            config: AppConfig
        ): String {
            // TODO: cLeanup
            return """<p>Hello, ${toUser.name}!</p>
                |
                |<p>The user ${fromUser.name} has invited you to see the '$path' stack. To see the stack, please follow this url:</p>
                | 
                |<p><a href="${config.address}/$path">${config.address}/$path</a></p>
                |
                |<p><i>The dstack.ai Team</i></p>""".trimMargin()
        }

        fun supportRequestEmailSubject(): String {
            return """Support request"""
        }

        fun supportRequestEmailPlainText(name: String?, email: String, company: String?, message: String): String {
            return """
                |$message
                |
                |${ if (name != null) "$name\n" else ""}Email: $email
                |${ if (company != null) "Company: $company"  else ""}""".trimMargin()
        }

        fun supportRequestEmailHtml(name: String?, email: String, company: String?, message: String): String {
            return """
                |<p>${message.replace("\n", "<br/>")}</p>
                |
                |<i>${ if (name != null) "$name<br/>" else ""}Email: $email<br/>
                |${ if (company != null) "Company: $company"  else ""}</i>""".trimMargin()
        }
    }
}