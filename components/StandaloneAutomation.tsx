"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Activity,
  MessageSquare,
  AlertTriangle,
  X,
  Globe,
  Zap,
  Download,
  BarChart3,
} from "lucide-react";
import { BusinessData, AutomationLog, AutomationStats } from "@/types/business";

interface StandaloneAutomationProps {
  businesses: BusinessData[];
  onBack: () => void;
}

export default function StandaloneAutomation({
  businesses,
  onBack,
}: StandaloneAutomationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    total: businesses.length,
    processed: 0,
    successful: 0,
    failed: 0,
    status: "idle",
  });
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const automationRef = useRef<boolean>(false);

  // Auto-scroll to bottom of logs
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [logs]);

  // Mock sites for demonstration
  const mockSites = [
    {
      name: "BuildZoom",
      category: "Construction Directory",
      successRate: 0.85,
    },
    { name: "Angi", category: "Home Services", successRate: 0.78 },
    { name: "Thumbtack", category: "Professional Services", successRate: 0.92 },
    { name: "HomeAdvisor", category: "Home Improvement", successRate: 0.73 },
    { name: "Houzz", category: "Design Platform", successRate: 0.89 },
    { name: "Yelp Business", category: "Local Directory", successRate: 0.94 },
  ];

  const addLog = (
    type: "info" | "success" | "error" | "warning",
    message: string,
    business?: string,
    details?: any
  ) => {
    const log: AutomationLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      business,
      message,
      details,
    };

    setLogs((prev) => [...prev, log]);
  };

  const updateStats = (updates: Partial<AutomationStats>) => {
    setStats((prev) => ({ ...prev, ...updates }));
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const simulateSubmission = async (business: BusinessData, site: any) => {
    const processingTime = Math.random() * 8000 + 2000; // 2-10 seconds

    addLog("info", `📝 Submitting to ${site.name}...`, business.name);

    // Simulate processing time
    await sleep(processingTime);

    // Simulate success/failure based on site success rate
    const isSuccess = Math.random() < site.successRate;

    if (isSuccess) {
      const submissionId = `SUB-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)}`;
      addLog(
        "success",
        `✅ Successfully submitted to ${site.name}`,
        business.name,
        {
          site: site.name,
          submissionId,
          processingTime: Math.round(processingTime),
          url: `https://${site.name.toLowerCase()}.com/business/${business.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
        }
      );

      // Sometimes add bonus actions
      if (Math.random() > 0.7) {
        await sleep(1000);
        addLog(
          "info",
          `📧 Confirmation email sent for ${site.name}`,
          business.name
        );
      }
    } else {
      const errors = [
        "Captcha challenge failed",
        "Rate limit exceeded",
        "Duplicate business detected",
        "Invalid service category",
        "Address verification failed",
        "Business license required",
      ];
      const error = errors[Math.floor(Math.random() * errors.length)];

      addLog(
        "warning",
        `⚠️ Failed to submit to ${site.name}: ${error}`,
        business.name,
        { site: site.name, error, processingTime: Math.round(processingTime) }
      );
    }

    return isSuccess;
  };

  const processBusiness = async (
    business: BusinessData,
    businessIndex: number
  ) => {
    if (!automationRef.current) return false;

    addLog(
      "info",
      `🔄 Starting automation for: ${business.name}`,
      business.name
    );
    updateStats({ currentBusiness: business.name });

    try {
      // Step 1: Business validation
      addLog("info", "🔍 Validating business information...", business.name);
      await sleep(1500);

      if (Math.random() < 0.05) {
        // 5% chance of validation failure
        throw new Error(
          "Business validation failed: Missing required license information"
        );
      }

      addLog("success", "✅ Business validation completed", business.name);

      // Step 2: Website analysis (if website exists)
      if (business.website) {
        addLog(
          "info",
          `🌐 Analyzing website: ${business.website}`,
          business.name
        );
        await sleep(2000);

        const websiteResults = {
          responsive: Math.random() > 0.2,
          seoScore: Math.floor(Math.random() * 40) + 60,
          loadTime: Math.floor(Math.random() * 3000) + 1000,
          hasContactForm: Math.random() > 0.3,
          socialMediaPresence: Math.random() > 0.4,
        };

        addLog(
          "info",
          `📊 Website analysis complete (SEO: ${websiteResults.seoScore}/100, Load: ${websiteResults.loadTime}ms)`,
          business.name,
          websiteResults
        );

        // Simulate finding social media
        if (websiteResults.socialMediaPresence) {
          await sleep(500);
          addLog(
            "info",
            "🔗 Social media profiles detected and analyzed",
            business.name
          );
        }
      }

      // Step 3: Submit to each site
      let successfulSubmissions = 0;
      const sitesToProcess = mockSites.slice(0, 4); // Process 4 sites

      for (const site of sitesToProcess) {
        if (!automationRef.current) break;

        // Sometimes simulate captcha
        if (Math.random() > 0.8) {
          addLog(
            "warning",
            `🔐 Captcha detected on ${site.name}, solving...`,
            business.name
          );
          await sleep(Math.random() * 10000 + 5000); // 5-15 seconds

          if (Math.random() > 0.1) {
            // 90% captcha success rate
            addLog(
              "success",
              `✅ Captcha solved for ${site.name}`,
              business.name
            );
          } else {
            addLog(
              "error",
              `❌ Captcha solving failed for ${site.name}`,
              business.name
            );
            continue;
          }
        }

        const success = await simulateSubmission(business, site);
        if (success) successfulSubmissions++;

        // Small delay between sites
        if (automationRef.current) await sleep(1000);
      }

      // Step 4: Generate report
      addLog("info", "📋 Generating automation report...", business.name);
      await sleep(1000);

      const successRate = Math.round(
        (successfulSubmissions / sitesToProcess.length) * 100
      );

      addLog(
        "success",
        `📊 Business automation completed: ${successfulSubmissions}/${sitesToProcess.length} successful submissions (${successRate}%)`,
        business.name,
        {
          totalSites: sitesToProcess.length,
          successfulSubmissions,
          successRate,
          timestamp: new Date().toISOString(),
        }
      );

      return successfulSubmissions > 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(
        "error",
        `❌ Business automation failed: ${errorMessage}`,
        business.name
      );
      return false;
    }
  };

  const startAutomation = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    automationRef.current = true;
    setLogs([]);

    updateStats({
      processed: 0,
      successful: 0,
      failed: 0,
      status: "running",
      currentBusiness: undefined,
    });

    addLog(
      "info",
      `🚀 Starting automation for ${businesses.length} businesses`
    );
    addLog("info", "🔧 Initializing automation engine...");
    await sleep(2000);
    addLog("success", "✅ Automation engine ready");

    let successful = 0;
    let failed = 0;

    for (let i = 0; i < businesses.length && automationRef.current; i++) {
      const business = businesses[i];

      const result = await processBusiness(business, i);

      if (result) {
        successful++;
      } else {
        failed++;
      }

      updateStats({
        processed: i + 1,
        successful,
        failed,
      });

      // Delay between businesses (except for the last one)
      if (i < businesses.length - 1 && automationRef.current) {
        addLog("info", "⏳ Waiting before processing next business...");
        await sleep(3000);
      }
    }

    // Final results
    updateStats({
      status: automationRef.current ? "completed" : "idle",
      currentBusiness: undefined,
    });

    if (automationRef.current) {
      addLog(
        "success",
        `🎉 Automation completed! Total: ${businesses.length}, Successful: ${successful}, Failed: ${failed}`
      );

      // Generate final report
      await sleep(1000);
      addLog("info", "📄 Generating final automation report...");
      await sleep(1500);
      addLog("success", "📋 Final report generated and ready for download");
    }

    setIsProcessing(false);
    automationRef.current = false;
  };

  const stopAutomation = () => {
    automationRef.current = false;
    setIsProcessing(false);
    updateStats({ status: "idle", currentBusiness: undefined });
    addLog("warning", "⏹️ Automation stopped by user");
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      businesses: businesses.map((b) => b.name),
      stats: stats,
      summary: {
        totalBusinesses: stats.total,
        processedBusinesses: stats.processed,
        successfulSubmissions: stats.successful,
        failedSubmissions: stats.failed,
        successRate:
          stats.total > 0
            ? Math.round((stats.successful / stats.total) * 100)
            : 0,
      },
      logs: logs.map((log) => ({
        timestamp: log.timestamp,
        type: log.type,
        business: log.business,
        message: log.message,
        details: log.details,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `automation-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog("success", "📥 Automation report downloaded successfully");
  };

  // Get log type styling
  const getLogTypeStyle = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  // Get log icon
  const getLogIcon = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Calculate progress percentage
  const progressPercentage =
    stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40">
      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Automation Demo
                </h1>
                <p className="text-slate-600 mt-1">
                  Live automation simulation for {businesses.length} businesses
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>

          {/* Demo Notice */}
          <Alert className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode:</strong> This is a simulated automation
              process. No actual submissions are made to external sites. Perfect
              for client demonstrations and testing the user interface.
            </AlertDescription>
          </Alert>

          {/* Control Panel */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Automation Control Panel
              </CardTitle>
              <CardDescription>
                Simulate the automation process with realistic timing and
                success rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Progress: {stats.processed} / {stats.total}
                  </span>
                  <span className="text-sm text-slate-600">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </div>
                  <div className="text-sm text-slate-600">Total</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.processed}
                  </div>
                  <div className="text-sm text-blue-600">Processed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.successful}
                  </div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Current Business */}
              {stats.currentBusiness && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600 animate-spin" />
                    <span className="text-sm font-medium text-purple-800">
                      Currently Processing:
                    </span>
                    <span className="text-sm text-purple-700">
                      {stats.currentBusiness}
                    </span>
                  </div>
                </div>
              )}

              {/* Simulated Sites */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Target Sites (Demo)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {mockSites.slice(0, 4).map((site, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Globe className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600">{site.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(site.successRate * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3 flex-wrap">
                {!isProcessing ? (
                  <Button
                    onClick={startAutomation}
                    disabled={businesses.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Demo Automation
                  </Button>
                ) : (
                  <Button onClick={stopAutomation} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Automation
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setLogs([])}
                  disabled={isProcessing}
                >
                  Clear Logs
                </Button>

                {stats.processed > 0 && (
                  <Button
                    variant="outline"
                    onClick={downloadReport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    const summary = `Automation Summary:\n\nTotal Businesses: ${
                      stats.total
                    }\nProcessed: ${stats.processed}\nSuccessful: ${
                      stats.successful
                    }\nFailed: ${stats.failed}\n\nSuccess Rate: ${
                      stats.total > 0
                        ? Math.round((stats.successful / stats.total) * 100)
                        : 0
                    }%`;
                    alert(summary);
                  }}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Quick Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Logs */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  Live Automation Logs
                </div>
                <Badge variant="outline">{logs.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4 bg-slate-50">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No logs yet. Click "Start Demo Automation" to begin the
                    simulation.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getLogTypeStyle(
                        log.type
                      )}`}
                      onClick={() => {
                        setSelectedLog(log);
                        setShowLogModal(true);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {getLogIcon(log.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-500">
                              {log.timestamp}
                            </span>
                            {log.business && (
                              <Badge variant="outline" className="text-xs">
                                {log.business}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm">{log.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Details Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLogIcon(selectedLog.type)}
              Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Timestamp:</strong> {selectedLog.timestamp}
                </div>
                <div>
                  <strong>Type:</strong>
                  <Badge
                    className={`ml-2 ${getLogTypeStyle(selectedLog.type)}`}
                  >
                    {selectedLog.type}
                  </Badge>
                </div>
                {selectedLog.business && (
                  <div className="col-span-2">
                    <strong>Business:</strong> {selectedLog.business}
                  </div>
                )}
              </div>
              <div>
                <strong>Message:</strong>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm">
                  {selectedLog.message}
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <strong>Details:</strong>
                  <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
