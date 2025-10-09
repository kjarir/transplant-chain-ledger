import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface LiveOrgan {
  id: string;
  organ_type: string;
  organ_label: string;
  status: 'available' | 'in_transit' | 'matched' | 'transplanted' | 'expired';
  location_name: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  blood_type?: string;
  organ_age?: number;
  organ_size?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  time_remaining?: number;
  recipient_id?: string;
  recipient_name?: string;
  recipient_location?: string;
  recipient_urgency?: string;
  contact_info?: string;
  medical_center_id?: string;
  medical_center_name?: string;
  donor_id?: string;
  donor_name?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  blockchain_hash?: string;
  is_verified: boolean;
  verification_notes?: string;
}

export interface MedicalCenter {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  contact_email?: string;
  specialties: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganTransplantLog {
  id: string;
  organ_id: string;
  action: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  details?: any;
  location?: string;
  timestamp: string;
  blockchain_hash?: string;
}

export class LiveOrganTrackingService {
  private static realtimeChannel: RealtimeChannel | null = null;
  private static subscribers: Map<string, (organs: LiveOrgan[]) => void> = new Map();

  // Get all live organs with real-time updates
  static async getLiveOrgans(filters?: {
    organType?: string;
    status?: string;
    urgency?: string;
    location?: { lat: number; lng: number; radius: number };
  }): Promise<LiveOrgan[]> {
    try {
      let query = supabase
        .from('live_organ_availability')
        .select('*')
        .neq('status', 'transplanted') // Don't show completed transplants
        .order('updated_at', { ascending: false });

      if (filters?.organType && filters.organType !== 'all') {
        query = query.eq('organ_type', filters.organType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.urgency) {
        query = query.eq('urgency', filters.urgency);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching live organs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching live organs:', error);
      return [];
    }
  }

  // Add a new organ to live tracking
  static async addLiveOrgan(organData: {
    organ_type: string;
    organ_label: string;
    status: string;
    location_name: string;
    location_address?: string;
    latitude?: number;
    longitude?: number;
    blood_type?: string;
    organ_age?: number;
    organ_size?: string;
    urgency: string;
    time_remaining?: number;
    donor_id?: string;
    donor_name?: string;
    medical_center_id?: string;
    medical_center_name?: string;
    contact_info?: string;
    expires_at?: string;
  }): Promise<LiveOrgan | null> {
    try {
      const { data, error } = await supabase
        .from('live_organ_availability')
        .insert([organData])
        .select()
        .single();

      if (error) {
        console.error('Error adding live organ:', error);
        // If table doesn't exist, return null but don't throw
        if (error.message?.includes('relation "live_organ_availability" does not exist')) {
          console.log('Live organ tracking table does not exist yet. Please initialize the database.');
          return null;
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding live organ:', error);
      return null;
    }
  }

  // Update organ status
  static async updateOrganStatus(
    organId: string,
    updates: {
      status?: string;
      recipient_id?: string;
      recipient_name?: string;
      recipient_location?: string;
      recipient_urgency?: string;
      time_remaining?: number;
      blockchain_hash?: string;
      verification_notes?: string;
    }
  ): Promise<LiveOrgan | null> {
    try {
      const { data, error } = await supabase
        .from('live_organ_availability')
        .update(updates)
        .eq('id', organId)
        .select()
        .single();

      if (error) {
        console.error('Error updating organ status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating organ status:', error);
      return null;
    }
  }

  // Get medical centers
  static async getMedicalCenters(): Promise<MedicalCenter[]> {
    try {
      const { data, error } = await supabase
        .from('medical_centers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching medical centers:', error);
        // If table doesn't exist, return empty array
        if (error.message?.includes('relation "medical_centers" does not exist')) {
          return [];
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching medical centers:', error);
      return [];
    }
  }

  // Get transplant logs for an organ
  static async getOrganLogs(organId: string): Promise<OrganTransplantLog[]> {
    try {
      const { data, error } = await supabase
        .from('organ_transplant_logs')
        .select('*')
        .eq('organ_id', organId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching organ logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching organ logs:', error);
      return [];
    }
  }

  // Subscribe to real-time updates
  static subscribeToLiveUpdates(
    subscriberId: string,
    callback: (organs: LiveOrgan[]) => void,
    filters?: {
      organType?: string;
      status?: string;
    }
  ): () => void {
    this.subscribers.set(subscriberId, callback);

    // Set up real-time subscription if not already active
    if (!this.realtimeChannel) {
      this.realtimeChannel = supabase
        .channel('live-organ-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_organ_availability'
          },
          async () => {
            // Fetch updated data and notify all subscribers
            const updatedOrgans = await this.getLiveOrgans();
            this.subscribers.forEach(cb => cb(updatedOrgans));
          }
        )
        .subscribe();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriberId);
      if (this.subscribers.size === 0 && this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
        this.realtimeChannel = null;
      }
    };
  }

  // Subscribe to transplant log updates
  static subscribeToTransplantLogs(
    organId: string,
    callback: (logs: OrganTransplantLog[]) => void
  ): () => void {
    const channel = supabase
      .channel(`transplant-logs-${organId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'organ_transplant_logs',
          filter: `organ_id=eq.${organId}`
        },
        async () => {
          const logs = await this.getOrganLogs(organId);
          callback(logs);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Get organ statistics
  static async getOrganStatistics(): Promise<{
    totalAvailable: number;
    criticalNeed: number;
    activeCenters: number;
    criticalCenters: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const organs = await this.getLiveOrgans();
      
      const stats = {
        totalAvailable: organs.filter(o => o.status === 'available').length,
        criticalNeed: organs.filter(o => o.urgency === 'critical').length,
        activeCenters: new Set(organs.map(o => o.medical_center_id).filter(Boolean)).size,
        criticalCenters: new Set(
          organs
            .filter(o => o.urgency === 'critical')
            .map(o => o.medical_center_id)
            .filter(Boolean)
        ).size,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>
      };

      // Count by type and status
      organs.forEach(organ => {
        stats.byType[organ.organ_type] = (stats.byType[organ.organ_type] || 0) + 1;
        stats.byStatus[organ.status] = (stats.byStatus[organ.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching organ statistics:', error);
      return {
        totalAvailable: 0,
        criticalNeed: 0,
        activeCenters: 0,
        criticalCenters: 0,
        byType: {},
        byStatus: {}
      };
    }
  }

  // Find nearby organs
  static async findNearbyOrgans(
    latitude: number,
    longitude: number,
    radiusKm: number = 100,
    organType?: string
  ): Promise<LiveOrgan[]> {
    try {
      // Simple distance calculation (for more accuracy, you'd want to use PostGIS)
      const earthRadius = 6371; // km
      const latDiff = radiusKm / earthRadius * (180 / Math.PI);
      const lngDiff = radiusKm / earthRadius * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);

      let query = supabase
        .from('live_organ_availability')
        .select('*')
        .gte('latitude', latitude - latDiff)
        .lte('latitude', latitude + latDiff)
        .gte('longitude', longitude - lngDiff)
        .lte('longitude', longitude + lngDiff)
        .eq('status', 'available')
        .order('updated_at', { ascending: false });

      if (organType && organType !== 'all') {
        query = query.eq('organ_type', organType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding nearby organs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error finding nearby organs:', error);
      return [];
    }
  }

  // Match organ with recipient
  static async matchOrganWithRecipient(
    organId: string,
    recipientId: string,
    recipientName: string,
    recipientLocation: string,
    recipientUrgency: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('live_organ_availability')
        .update({
          status: 'matched',
          recipient_id: recipientId,
          recipient_name: recipientName,
          recipient_location: recipientLocation,
          recipient_urgency: recipientUrgency,
          time_remaining: 24 // 24 hours to complete transplant
        })
        .eq('id', organId);

      if (error) {
        console.error('Error matching organ:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error matching organ:', error);
      return false;
    }
  }

  // Mark organ as transplanted
  static async markAsTransplanted(
    organId: string,
    blockchainHash?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('live_organ_availability')
        .update({
          status: 'transplanted',
          blockchain_hash: blockchainHash,
          time_remaining: 0
        })
        .eq('id', organId);

      if (error) {
        console.error('Error marking organ as transplanted:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking organ as transplanted:', error);
      return false;
    }
  }

  // Delete organ (for cleanup)
  static async deleteOrgan(organId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('live_organ_availability')
        .delete()
        .eq('id', organId);

      if (error) {
        console.error('Error deleting organ:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting organ:', error);
      return false;
    }
  }
}
