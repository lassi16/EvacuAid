import { 
  BarChart3, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Performance Analytics</h1>
          <p className="text-slate-500">System insights and responder metrics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Incidents (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,248</div>
            <p className="text-xs text-brand-green mt-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> 12% vs last year
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg Acknowledgement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">45s</div>
            <p className="text-xs text-brand-green mt-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> 5s improvement
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-brand-red/30 bg-brand-red/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-red">False Alarms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-red">14</div>
            <p className="text-xs text-brand-red/70 mt-1">
              Requires sensor calibration
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>Average time to resolution per month.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {/* Mock Chart Area */}
            <div className="w-full h-48 border-b border-l border-slate-200 relative mt-8">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 -z-10 opacity-20">
                {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className="border-t border-r border-slate-200"></div>
                ))}
              </div>
              
              {/* Mock Line Graph */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <path 
                  d="M0,80 Q20,60 40,70 T80,50 T120,40 T160,20" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  fill="none" 
                  className="text-brand-green"
                  vectorEffect="non-scaling-stroke"
                  transform="scale(2, 2) translate(0, 0)"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Top responders by resolution rate.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">M1</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Medical Team Alpha</p>
                    <p className="text-xs text-slate-500">142 cases resolved</p>
                  </div>
                </div>
                <div className="text-brand-green font-mono font-bold">99.8%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs">S1</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Security Unit 1</p>
                    <p className="text-xs text-slate-500">89 cases resolved</p>
                  </div>
                </div>
                <div className="text-brand-green font-mono font-bold">97.4%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">F2</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Fire Dept Bravo</p>
                    <p className="text-xs text-slate-500">34 cases resolved</p>
                  </div>
                </div>
                <div className="text-brand-green font-mono font-bold">96.5%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
