import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PersonalInformation() {
  const [userData] = useState({
    name: "Sam Crony",
    phone: "985684456",
    client: "Samsung",
    applied: "June 10, 2025, 06:45 PM",
    onlineId: "June 10, 2025, 06:45 PM",
    status: "June 10, 2025, 06:45 PM",
    totalVerifications: 216
  });

  return (
    <div className="space-y-6">
      {/* Total Verifications Card */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary/20 to-primary-glow/10 flex items-center justify-center">
                <img src="/icons/user-verification-icon.svg" alt="Verification" className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Verifications</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">{userData.totalVerifications}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information Card */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            {/* User Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20"></div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-card-foreground">{userData.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <img src="/icons/call-icon.svg" alt="Phone" className="w-4 h-4" />
                    <span className="text-xs">{userData.phone}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Details
              </Button>
            </div>

            {/* User Details Section */}
            <div className="space-y-4">
              {/* Client */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <img src="/icons/company-portal-icon.svg" alt="Client" className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground">Client</span>
                </div>
                <div>
                  <span className="text-xs">{userData.client}</span>
                </div>
              </div>

              {/* Applied */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <img src="/icons/calendar-icon.svg" alt="Applied" className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground">Applied</span>
                </div>
                <div>
                  <span className="text-xs">{userData.applied}</span>
                </div>
              </div>

              {/* Online ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <img src="/icons/user-id-icon.svg" alt="Online ID" className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground">Online ID</span>
                </div>
                <div>
                  <span className="text-xs">{userData.onlineId}</span>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <img src="/icons/status-icon.svg" alt="Status" className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground">Status</span>
                </div>
                <div>
                  <span className="text-xs">{userData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}