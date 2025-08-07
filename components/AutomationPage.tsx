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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Activity,
  MessageSquare,
  Wifi,
  WifiOff,
  AlertTriangle,
  X,
  Bot,
  Building2,
  Mail,
  Key,
  Globe,
  Image,
  Loader2,
} from "lucide-react";
import { BusinessData } from "@/types/business";
import { io, Socket } from "socket.io-client";

interface AutomationPageProps {
  businesses: BusinessData[];
  accessToken: string;
  onBack: () => void;
}

interface BotStatus {
  phase: string;
  isRunning: boolean;
  connectedClients: number;
  serverUptime: number;
  timestamp: string;
}

interface BusinessProgress {
  businessName: string;
  site: string;
  currentStep: string;
  stepMessage: string;
  progress: number;
  startTime: string;
  lastUpdate: string;
  imagesCount: number;
  gmailStatus: string;
  generatedPassword: string;
  errors: string[];
  verificationUrl?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "phase"
    | "business"
    | "submission";
  business?: string;
  details?: any;
}

interface ProgressSummary {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
}

export default function AutomationPage({
  businesses,
  accessToken,
  onBack,
}: AutomationPageProps) {
  // Bot Integration State
  const [botSocket, setBotSocket] = useState<Socket | null>(null);
  const [botConnected, setBotConnected] = useState(false);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [businessProgress, setBusinessProgress] = useState<
    Map<string, BusinessProgress>
  >(new Map());
  const [botLogs, setBotLogs] = useState<LogEntry[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<ProgressSummary | null>(null);
  const [connectionError, setConnectionError] = useState<string>("");

  // UI State
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "businesses" | "logs"
  >("overview");

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [botLogs]);

  // Initialize bot WebSocket connection
  const connectToBotServer = () => {
    try {
      const BOT_API_URL =
        process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";
      console.log(`Connecting to bot server at ${BOT_API_URL}`);
      const socket = io(BOT_API_URL, {
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("Connected to bot server");
        setBotConnected(true);
        setConnectionError("");
        addBotLog("info", "Connected to bot monitoring server");
        // Request initial status
        socket.emit("requestStatus");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from bot server");
        setBotConnected(false);
        addBotLog("warning", "Disconnected from bot server");
      });

      socket.on("connect_error", (error) => {
        setConnectionError(`Failed to connect to bot server: ${error.message}`);
        setBotConnected(false);
        addBotLog("error", "Bot server connection error");
      });

      // Listen for bot status updates
      socket.on("statusUpdate", (status: BotStatus) => {
        setBotStatus(status);
      });

      // Listen for phase changes
      socket.on("phaseChange", (phaseData) => {
        setBotStatus((prev) =>
          prev ? { ...prev, phase: phaseData.newPhase } : null
        );
        addBotLog(
          "phase",
          `Bot phase: ${phaseData.oldPhase} → ${phaseData.newPhase}`
        );
      });

      // Listen for progress updates
      socket.on("progress", (progressData) => {
        fetchProgressSummary();
      });

      // Listen for business progress updates
      socket.on("businessProgress", (progress: BusinessProgress) => {
        setBusinessProgress((prev) => {
          const newMap = new Map(prev);
          const key = `${progress.businessName}-${progress.site}`;
          newMap.set(key, progress);
          return newMap;
        });

        addBotLog(
          "business",
          `${progress.businessName} → ${progress.site}: ${progress.currentStep} (${progress.progress}%)`,
          progress.businessName,
          progress
        );
      });

      // Listen for log messages
      socket.on("log", (logData: LogEntry) => {
        addBotLog(
          logData.type,
          logData.message,
          logData.business,
          logData.details
        );
      });

      setBotSocket(socket);
    } catch (error) {
      setConnectionError("Unable to establish connection to bot server");
      addBotLog("error", "Failed to initialize bot connection");
    }
  };

  // Fetch progress summary from API
  const fetchProgressSummary = async () => {
    try {
      const BOT_API_URL =
        process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";
      const response = await fetch(`${BOT_API_URL}/api/progress/summary`);
      if (response.ok) {
        const summary = await response.json();
        setProgressSummary(summary);
      }
    } catch (error) {
      console.error("Failed to fetch progress summary:", error);
    }
  };

  // Add bot log entry
  const addBotLog = (
    type: LogEntry["type"],
    message: string,
    business?: string,
    details?: any
  ) => {
    const log: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      business,
      message,
      details,
    };
    setBotLogs((prev) => [...prev, log].slice(-200)); // Keep last 200 logs
  };

  // Start bot automation
  const startBotAutomation = () => {
    if (!botSocket || !botConnected) {
      addBotLog("error", "Bot server not connected. Please connect first.");
      return;
    }

    // Send start command to bot
    botSocket.emit("startBot");
    addBotLog(
      "info",
      `🚀 Starting bot automation for ${businesses.length} businesses...`
    );
  };

  // Stop bot automation
  const stopBotAutomation = () => {
    if (botSocket && botConnected) {
      botSocket.emit("stopBot");
      addBotLog("warning", "⏹️ Bot automation stopped by user");
    }
  };

  // Clear progress data
  const clearBotProgress = async () => {
    try {
      const BOT_API_URL =
        process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";
      await fetch(`${BOT_API_URL}/api/progress/clear`, { method: "POST" });
      setBusinessProgress(new Map());
      addBotLog("info", "Progress data cleared");
    } catch (error) {
      addBotLog("error", "Failed to clear progress data");
    }
  };

  // Get log type styling
  const getLogTypeStyle = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "phase":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "business":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "submission":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  // Get log icon
  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "phase":
        return <Bot className="h-4 w-4" />;
      case "business":
        return <Building2 className="h-4 w-4" />;
      case "submission":
        return <Globe className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Get step icon
  const getStepIcon = (step: string) => {
    if (step.includes("GMAIL") || step.includes("EMAIL"))
      return <Mail className="h-4 w-4" />;
    if (step.includes("PASSWORD")) return <Key className="h-4 w-4" />;
    if (step.includes("IMAGE")) return <Image className="h-4 w-4" />;
    if (step.includes("SUBMIT")) return <Globe className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  // Get step color
  const getStepColor = (step: string) => {
    if (step.includes("FAILED")) return "text-red-600 bg-red-50";
    if (step.includes("COMPLETED")) return "text-green-600 bg-green-50";
    if (step.includes("WAITING")) return "text-yellow-600 bg-yellow-50";
    if (step.includes("PROCESSING")) return "text-blue-600 bg-blue-50";
    return "text-slate-600 bg-slate-50";
  };

  // Initialize connections on component mount
  useEffect(() => {
    connectToBotServer();

    return () => {
      if (botSocket) {
        botSocket.close();
      }
    };
  }, []);

  // Calculate overall progress
  const overallProgress = progressSummary
    ? (progressSummary.completed / Math.max(progressSummary.total, 1)) * 100
    : 0;

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
                  Bot Automation Center
                </h1>
                <p className="text-slate-600 mt-1">
                  Real-time bot monitoring for {businesses.length} businesses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {botConnected ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Bot Connected
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Bot Disconnected
                </Badge>
              )}
              {botStatus && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Bot className="h-3 w-3 mr-1" />
                  {botStatus.phase}
                </Badge>
              )}
            </div>
          </div>

          {/* Connection Error */}
          {connectionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {connectionError}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectToBotServer}
                  className="ml-3"
                >
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Control Panel */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                Bot Control Panel
              </CardTitle>
              <CardDescription>
                Control your business directory automation bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Progress */}
              {progressSummary && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Overall Progress: {progressSummary.completed} /{" "}
                      {progressSummary.total}
                    </span>
                    <span className="text-sm text-slate-600">
                      {overallProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              {progressSummary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">
                      {progressSummary.total}
                    </div>
                    <div className="text-sm text-slate-600">Total</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {progressSummary.inProgress}
                    </div>
                    <div className="text-sm text-blue-600">Processing</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {progressSummary.completed}
                    </div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {progressSummary.failed}
                    </div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {progressSummary.pending}
                    </div>
                    <div className="text-sm text-yellow-600">Pending</div>
                  </div>
                </div>
              )}

              {/* Bot Status */}
              {botStatus && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-purple-800">
                        Phase:
                      </span>
                      <span className="ml-2 text-purple-700">
                        {botStatus.phase}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-purple-800">
                        Uptime:
                      </span>
                      <span className="ml-2 text-purple-700">
                        {Math.floor(botStatus.serverUptime || 0)}s
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-purple-800">
                        Clients:
                      </span>
                      <span className="ml-2 text-purple-700">
                        {botStatus.connectedClients}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={startBotAutomation}
                  disabled={!botConnected || botStatus?.isRunning}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {botStatus?.isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Bot Running
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Bot
                    </>
                  )}
                </Button>

                <Button
                  onClick={stopBotAutomation}
                  variant="destructive"
                  disabled={!botConnected || !botStatus?.isRunning}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Bot
                </Button>

                <Button
                  variant="outline"
                  onClick={clearBotProgress}
                  disabled={!botConnected}
                >
                  Clear Progress
                </Button>

                <Button
                  variant="outline"
                  onClick={connectToBotServer}
                  disabled={botConnected}
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs
            value={activeTab}
            onValueChange={(value: any) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="businesses">Business Progress</TabsTrigger>
              <TabsTrigger value="logs">Live Logs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Automation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Businesses Loaded:</span>
                        <span className="font-semibold">
                          {businesses.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bot Status:</span>
                        <span
                          className={`font-semibold ${
                            botStatus?.isRunning
                              ? "text-green-600"
                              : "text-slate-600"
                          }`}
                        >
                          {botStatus?.isRunning ? "Running" : "Idle"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span
                          className={`font-semibold ${
                            botConnected ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {botConnected ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                      {progressSummary && (
                        <>
                          <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <span className="font-semibold text-green-600">
                              {progressSummary.total > 0
                                ? (
                                    (progressSummary.completed /
                                      progressSummary.total) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {botLogs
                        .slice(-5)
                        .reverse()
                        .map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-xs text-slate-500 w-16">
                              {log.timestamp.split(":").slice(0, 2).join(":")}
                            </span>
                            <div
                              className={`flex items-center gap-1 ${
                                getLogTypeStyle(log.type).split(" ")[0]
                              }`}
                            >
                              {getLogIcon(log.type)}
                              <span className="truncate">{log.message}</span>
                            </div>
                          </div>
                        ))}
                      {botLogs.length === 0 && (
                        <div className="text-center py-4 text-slate-500">
                          No activity yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Business Progress Tab */}
            <TabsContent value="businesses">
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Progress Tracking
                  </CardTitle>
                  <CardDescription>
                    Real-time progress for each business submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Array.from(businessProgress.values()).length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No business progress yet. Start the bot to see real-time
                        updates.
                      </div>
                    ) : (
                      Array.from(businessProgress.values()).map((progress) => (
                        <div
                          key={`${progress.businessName}-${progress.site}`}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {progress.businessName}
                              </h4>
                              <p className="text-sm text-slate-600">
                                Target: {progress.site}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {progress.progress}%
                            </Badge>
                          </div>

                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progress}%` }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div
                              className={`flex items-center gap-2 p-2 rounded ${getStepColor(
                                progress.currentStep
                              )}`}
                            >
                              {getStepIcon(progress.currentStep)}
                              <span className="font-medium">Step:</span>
                              <span>{progress.currentStep}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                              <Clock className="h-4 w-4 text-slate-600" />
                              <span className="text-slate-600">
                                Updated:{" "}
                                {new Date(
                                  progress.lastUpdate
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <p>
                              <strong>Message:</strong> {progress.stepMessage}
                            </p>
                            {progress.imagesCount > 0 && (
                              <p>
                                <strong>Images:</strong> {progress.imagesCount}
                              </p>
                            )}
                            {progress.gmailStatus && (
                              <p>
                                <strong>Gmail:</strong> {progress.gmailStatus}
                              </p>
                            )}
                            {progress.generatedPassword && (
                              <p>
                                <strong>Password:</strong>{" "}
                                {progress.generatedPassword}
                              </p>
                            )}
                            {progress.errors.length > 0 && (
                              <p className="text-red-600">
                                <strong>Errors:</strong>{" "}
                                {progress.errors.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Real-time Bot Logs
                    </div>
                    <Badge variant="outline">{botLogs.length} entries</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4 bg-slate-50">
                    {botLogs.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No logs yet. Bot logs will appear here in real-time.
                      </div>
                    ) : (
                      botLogs.map((log) => (
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
                                <span className="text-xs font-mono">
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
            </TabsContent>
          </Tabs>
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
