"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronRight,
  Shield,
  Key,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const GoogleAppPasswordGuide = () => {
  const [currentPage, setCurrentPage] = useState("overview");

  const OverviewPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Google App Password Setup
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure your applications with Google App Passwords. Follow our
            step-by-step guide to enhance your account security.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2 text-blue-600" />
                What is an App Password?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                An App Password is a unique 16-character code that lets
                third-party apps or devices access your Google account securely.
                To set one up, you'll need to enable two-factor authentication
                (2FA) on your email account.
              </p>
              <p className="text-gray-600 mb-4">
                Google introduced App Passwords to make email accounts safer.
                They no longer allow third-party apps to connect to Gmail or
                GSuite using your regular password through SMTP/IMAP. Instead,
                you need to create an App Password for IMAP email automation.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Image
                  src="/images/app-password-example.png"
                  alt="App Password Example"
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p className="text-sm text-blue-700">
                  Example: xxxx-xxxx-xxxx-xxxx
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-green-600" />
                Why Do You Need It?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This extra step helps ensure your email connects securely to any
                third-party tool without compromising your account's security.
                App Passwords are required for IMAP email automation and other
                third-party services.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <Image
                  src="/images/third-party-apps.png"
                  alt="Third-party Apps Security"
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p className="text-sm text-green-700">
                  Common uses: Email automation, IMAP clients, Mobile apps, API
                  integrations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> App Passwords can only be used with
            accounts that have 2-Step Verification enabled. Make sure you have
            this set up before proceeding.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Google Account</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>2-Step Verification Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Access to Google Account Settings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => setCurrentPage("setup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Setup Guide
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  const SetupPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => setCurrentPage("overview")}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Step-by-Step Setup Guide
          </h1>
          <p className="text-gray-600">
            Follow these steps to create your Google App Password
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="mr-3">1</Badge>
                Enable Two-Factor Authentication (2FA) First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Go to your Google Account's Security Settings. Scroll to the{" "}
                    <strong>"How you sign in to Google"</strong> section and
                    enable <strong>2-Step Verification</strong>.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Follow the on-screen instructions to add your phone number
                    or other 2FA methods like Google Authenticator or security
                    keys.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      Quick Link:
                    </p>
                    <code className="text-sm bg-white p-2 rounded border">
                      myaccount.google.com/security
                    </code>
                  </div>
                </div>
                <div>
                  <Image
                    src="/images/enable-2fa-security.png"
                    alt="Enable 2FA in Google Security Settings"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="mr-3">2</Badge>
                Access the App Passwords Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    After enabling 2-Step Verification, go back to the{" "}
                    <strong>"Security"</strong> section in your Google account
                    settings.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Locate the <strong>App Passwords</strong> option and click
                    on it, or simply type "App Password" in the search bar to
                    find it quickly.
                  </p>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      This option only appears after 2-Step Verification is
                      enabled.
                    </AlertDescription>
                  </Alert>
                </div>
                <div>
                  <Image
                    src="/images/app-passwords-security.png"
                    alt="App Passwords in Security Settings"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="mr-3">3</Badge>
                Sign in Again for Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Google may ask you to sign in again to verify your identity.
                    Once verified, you will be directed to the{" "}
                    <strong>App Passwords</strong> page.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Enter the name of the app you need the password for in the{" "}
                    <strong>App Name</strong> field, and click on{" "}
                    <strong>Create</strong> to generate your App Password.
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Tip:</strong> Use descriptive names like "IMAP
                      Email Automation" or "Email Data Collection" for easy
                      identification.
                    </p>
                  </div>
                </div>
                <div>
                  <Image
                    src="/images/create-app-password.png"
                    alt="Create App Password Screen"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="mr-3">4</Badge>
                Copy Your Generated App Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    A pop-up will appear where Google generates a 16-character
                    App Password. Copy this password immediately as you won't be
                    able to see it again.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Use this App Password in your third-party application
                    instead of your regular Google password.
                  </p>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Save this password securely.
                      Google will not show it again after you close this window.
                    </AlertDescription>
                  </Alert>
                </div>
                <div>
                  <Image
                    src="/images/generated-app-password.png"
                    alt="Generated App Password Display"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Example format:
                    </p>
                    <code className="text-lg font-mono bg-white p-2 rounded border block text-center">
                      abcd efgh ijkl mnop
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="mr-3">5</Badge>
                Use App Password for IMAP Email Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Use your App Password to configure IMAP access for automated
                    email retrieval and processing. This allows your automation
                    scripts to securely access your Gmail inbox.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Configure your automation tool with IMAP settings to read
                    emails and save the data to Google Sheets stored in your
                    Google Drive folders.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      IMAP Configuration:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Server: imap.gmail.com</li>
                      <li>• Port: 993 (SSL/TLS)</li>
                      <li>• Username: your-email@gmail.com</li>
                      <li>• Password: Use the 16-character App Password</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <Image
                    src="/images/imap-automation-setup.png"
                    alt="IMAP Email Automation Setup"
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Card */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-6 w-6 mr-2" />
                Setup Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Congratulations! You've successfully created your Google App
                Password and can now use it for IMAP email automation to
                securely access your Gmail and save data to Google Sheets in
                your Drive folders.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    Next Steps:
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Configure IMAP settings in your automation</li>
                    <li>• Test email connectivity with App Password</li>
                    <li>• Set up Google Sheets data saving</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Remember:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Use imap.gmail.com:993 for secure connection</li>
                    <li>• Keep your App Password secure</li>
                    <li>• Monitor your automation logs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={() => setCurrentPage("overview")}
            variant="outline"
            className="mr-4"
          >
            Back to Overview
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Setup Complete
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {currentPage === "overview" ? <OverviewPage /> : <SetupPage />}
    </div>
  );
};

export default GoogleAppPasswordGuide;
