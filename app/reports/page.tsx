"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { FileText, Building2, DollarSign, TrendingUp, Download, CheckCircle, Clock, Target } from "lucide-react"

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [reportType, setReportType] = useState("overview")

  // Sample data for charts
  const contractsByMonth = [
    { month: "T1", contracts: 12, value: 2.4 },
    { month: "T2", contracts: 15, value: 3.2 },
    { month: "T3", contracts: 18, value: 4.1 },
    { month: "T4", contracts: 22, value: 5.3 },
    { month: "T5", contracts: 19, value: 4.8 },
    { month: "T6", contracts: 25, value: 6.2 },
  ]

  const contractsByStatus = [
    { name: "Hoàn thành", value: 45, color: "#22c55e" },
    { name: "Đang thực hiện", value: 32, color: "#3b82f6" },
    { name: "Chờ phê duyệt", value: 15, color: "#f59e0b" },
    { name: "Tạm dừng", value: 8, color: "#ef4444" },
  ]

  const contractsByCategory = [
    { category: "Xây dựng", count: 45, value: 12.5, growth: 8.2 },
    { category: "Cung cấp", count: 32, value: 8.3, growth: -2.1 },
    { category: "Dịch vụ", count: 28, value: 6.7, growth: 15.3 },
    { category: "Tư vấn", count: 18, value: 4.2, growth: 5.8 },
    { category: "Bảo trì", count: 12, value: 2.8, growth: -1.2 },
  ]

  const topContractors = [
    { name: "Công ty TNHH ABC", contracts: 12, value: 3.2, rating: 4.8, completion: 95 },
    { name: "Tập đoàn XYZ", contracts: 8, value: 2.8, rating: 4.6, completion: 92 },
    { name: "Công ty DEF", contracts: 10, value: 2.1, rating: 4.4, completion: 88 },
    { name: "Công ty GHI", contracts: 6, value: 1.9, rating: 4.2, completion: 90 },
    { name: "Tập đoàn JKL", contracts: 7, value: 1.6, rating: 4.0, completion: 85 },
  ]

  const performanceData = [
    { month: "T1", onTime: 85, delayed: 15, budget: 92 },
    { month: "T2", onTime: 88, delayed: 12, budget: 94 },
    { month: "T3", onTime: 92, delayed: 8, budget: 89 },
    { month: "T4", onTime: 87, delayed: 13, budget: 91 },
    { month: "T5", onTime: 94, delayed: 6, budget: 96 },
    { month: "T6", onTime: 91, delayed: 9, budget: 93 },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Báo cáo & Thống kê</h1>
              <p className="text-muted-foreground mt-2">Phân tích hiệu suất và xu hướng hợp đồng</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 tháng</SelectItem>
                  <SelectItem value="3months">3 tháng</SelectItem>
                  <SelectItem value="6months">6 tháng</SelectItem>
                  <SelectItem value="1year">1 năm</SelectItem>
                  <SelectItem value="all">Tất cả</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
              <TabsTrigger value="contractors">Nhà thầu</TabsTrigger>
              <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng hợp đồng</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">247</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+12%</span> so với kỳ trước
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.4B VNĐ</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+8.2%</span> tăng trưởng
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nhà thầu hoạt động</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+3</span> nhà thầu mới
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2%</div>
                    <p className="text-xs text-muted-foreground">Đúng thời hạn</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contracts by Month */}
                <Card>
                  <CardHeader>
                    <CardTitle>Xu hướng hợp đồng theo tháng</CardTitle>
                    <CardDescription>Số lượng và giá trị hợp đồng 6 tháng gần đây</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={contractsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="contracts"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Line yAxisId="right" type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Contracts by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Phân bố theo trạng thái</CardTitle>
                    <CardDescription>Tỷ lệ hợp đồng theo từng trạng thái</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={contractsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {contractsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích theo danh mục</CardTitle>
                  <CardDescription>Thống kê hợp đồng theo từng lĩnh vực</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractsByCategory.map((category) => (
                      <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{category.category}</h4>
                            <Badge variant={category.growth > 0 ? "default" : "destructive"}>
                              {category.growth > 0 ? "+" : ""}
                              {category.growth}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">{category.count}</span> hợp đồng
                            </div>
                            <div>
                              <span className="font-medium">{category.value}B VNĐ</span> giá trị
                            </div>
                            <div>
                              <TrendingUp className="h-4 w-4 inline mr-1" />
                              {category.growth > 0 ? "Tăng" : "Giảm"} {Math.abs(category.growth)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ giá trị theo danh mục</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={contractsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contractors Tab */}
            <TabsContent value="contractors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top nhà thầu</CardTitle>
                  <CardDescription>Xếp hạng nhà thầu theo hiệu suất và giá trị hợp đồng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContractors.map((contractor, index) => (
                      <div key={contractor.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{contractor.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{contractor.contracts} hợp đồng</span>
                              <span>{contractor.value}B VNĐ</span>
                              <div className="flex items-center space-x-1">
                                <span>Đánh giá: {contractor.rating}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.floor(contractor.rating) ? "bg-yellow-400" : "bg-gray-200"
                                      } rounded-full mr-1`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{contractor.completion}% hoàn thành</div>
                          <Progress value={contractor.completion} className="w-24 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đúng hạn</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">91%</div>
                    <p className="text-xs text-muted-foreground">Trung bình 6 tháng</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trễ hạn</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">9%</div>
                    <p className="text-xs text-muted-foreground">Giảm 2% so với kỳ trước</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đúng ngân sách</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">93%</div>
                    <p className="text-xs text-muted-foreground">Tăng 1% so với kỳ trước</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng hiệu suất</CardTitle>
                  <CardDescription>Theo dõi hiệu suất thực hiện hợp đồng theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="onTime" stroke="#22c55e" strokeWidth={2} name="Đúng hạn %" />
                      <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} name="Đúng ngân sách %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
