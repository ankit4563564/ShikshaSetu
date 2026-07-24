'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CampusCardRecord } from '@/lib/campus-id/types';
import QRCode from 'qrcode';
import { Avatar } from '@/components/shared/Avatar';

const TOKEN_VALIDITY_SECONDS = 180;

export interface MedicalFlagDisplay {
  flagType: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

interface CampusIdCardProps {
  studentId: string;
  studentName: string;
  grade: string;
  section: string | null;
  rollNumber: string | null;
  avatarUrl: string | null;
  house: string | null;
  guardianName: string | null;
  busRoute: string | null;
  emergencyContact?: string | null;
  academicYear?: string | null;
  medicalFlags?: MedicalFlagDisplay[];
}

export function CampusIdCard({
  studentId,
  studentName,
  grade,
  section,
  rollNumber,
  avatarUrl,
  house,
  guardianName,
  busRoute,
  emergencyContact,
  academicYear,
  medicalFlags,
}: CampusIdCardProps) {
  const [qrContent, setQrContent] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [prevQrDataUrl, setPrevQrDataUrl] = useState<string | null>(null);
  const [card, setCard] = useState<CampusCardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [countdown, setCountdown] = useState(TOKEN_VALIDITY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [animating, setAnimating] = useState(false);
  const cardRef = useRef<string | null>(null);
  const cardIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: cards } = await supabase
          .from('campus_cards')
          .select('*')
          .eq('student_id', studentId)
          .eq('status', 'active')
          .order('issued_at', { ascending: false });

        const primaryCard = Array.isArray(cards) && cards.length > 0
          ? (cards.find((c: any) => c.card_type === 'student_id') || cards[0])
          : null;

        if (primaryCard) {
          setCard(primaryCard as CampusCardRecord);
          cardIdRef.current = primaryCard.id;
          await refreshToken(primaryCard.id);
        }
      } catch (err) {
        console.error('[CampusIdCard] Failed to load card:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const refreshToken = async (cid: string) => {
    try {
      const response = await fetch('/api/campus-id/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: cid }),
      });
      const data = await response.json();
      if (data.qrContent && data.qrContent !== cardRef.current) {
        cardRef.current = data.qrContent;
        setQrContent(data.qrContent);
        setCountdown(TOKEN_VALIDITY_SECONDS);
        setIsExpired(false);
      }
    } catch {
      // Token refresh failed — countdown will reach 0 and show expired state
    }
  };

  useEffect(() => {
    if (!qrContent) return;

    const generate = async () => {
      setAnimating(true);
      const url = await QRCode.toDataURL(qrContent, { width: 400, margin: 1 });
      setQrDataUrl((prev) => {
        setPrevQrDataUrl(prev);
        return url;
      });
      setTimeout(() => setAnimating(false), 300);
    };

    generate();
  }, [qrContent]);

  useEffect(() => {
    if (!showQr || !cardIdRef.current) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          if (cardIdRef.current) {
            refreshToken(cardIdRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showQr]);

  useEffect(() => {
    if (!showQr || !cardIdRef.current || countdown > 30) return;
    if (countdown === 30) {
      refreshToken(cardIdRef.current);
    }
  }, [countdown, showQr]);

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      {/* Card Front */}
      <div className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-gradient-to-br from-white to-indigo-50/40 shadow-[0_18px_45px_rgba(63,81,181,.12)] backdrop-blur-xl">
        <div className="bg-gradient-to-r from-primary to-[#5967d0] px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-extrabold tracking-tight text-white">ShikshaSetu</p>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Campus Pass
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-4">
            <Avatar
              src={avatarUrl}
              alt={studentName}
              size="xl"
              rounded="lg"
              showBorder
              className="shadow-sm"
            />
            <div>
              <h3 className="font-display text-xl font-extrabold text-deep-teal">{studentName}</h3>
              <p className="mt-0.5 text-sm font-semibold text-deep-teal/60">
                Class {grade}{section ? ` - ${section}` : ''}
                {rollNumber ? ` · Roll ${rollNumber}` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-deep-teal/5 p-4">
            {house && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-deep-teal/60">House</span>
                <span className="font-bold text-deep-teal">{house}</span>
              </div>
            )}
            {academicYear && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-deep-teal/60">Academic Year</span>
                <span className="font-bold text-deep-teal">{academicYear}</span>
              </div>
            )}
            {busRoute && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-deep-teal/60">Bus Route</span>
                <span className="font-bold text-deep-teal">{busRoute}</span>
              </div>
            )}
            {guardianName && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-deep-teal/60">Guardian</span>
                <span className="font-bold text-deep-teal">{guardianName}</span>
              </div>
            )}
            {emergencyContact && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-deep-teal/60">Emergency</span>
                <span className="font-bold text-deep-teal">{emergencyContact}</span>
              </div>
            )}
          </div>

          {medicalFlags && medicalFlags.length > 0 && (
            <div className="mt-3 space-y-1.5 rounded-xl bg-warm-clay/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-clay/70">Medical Flags</p>
              {medicalFlags.map((flag, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    flag.severity === 'critical' ? 'bg-warm-clay animate-pulse' :
                    flag.severity === 'warning' ? 'bg-marigold' :
                    'bg-deep-teal/40'
                  }`} />
                  <span className={`text-xs font-semibold ${
                    flag.severity === 'critical' ? 'text-warm-clay' :
                    flag.severity === 'warning' ? 'text-marigold' :
                    'text-deep-teal/60'
                  }`}>
                    {flag.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Toggle */}
      <button
        type="button"
        onClick={() => setShowQr(!showQr)}
        className="mt-4 w-full rounded-xl border border-deep-teal/20 bg-white px-5 py-3 font-display text-sm font-bold text-deep-teal transition-colors hover:bg-deep-teal/5"
      >
        {showQr ? 'Hide QR Code' : 'Show QR Code'}
      </button>

      {/* QR Code (Back of Card) */}
      {showQr && qrContent && (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(63,81,181,.12)]">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-3 h-48 w-48 rounded-xl bg-deep-teal/5 p-3">
              {prevQrDataUrl && animating && (
                <img
                  src={prevQrDataUrl}
                  alt=""
                  className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] object-contain opacity-0 transition-opacity duration-300"
                  style={{ opacity: isExpired ? 0 : 0 }}
                />
              )}
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="ShikshaSetu Digital Campus Pass QR Code"
                  className={`h-full w-full transition-opacity duration-300 ${isExpired ? 'opacity-20' : animating ? 'opacity-100' : 'opacity-100'}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
                </div>
              )}
              {isExpired && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-lg bg-white/80 px-3 py-1 text-xs font-bold text-warm-clay shadow-sm">
                    Token expired
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${countdown <= 15 ? 'bg-warm-clay animate-pulse' : countdown <= 30 ? 'bg-amber-400' : 'bg-sage'}`} />
              <span className="font-mono text-xs font-bold tabular-nums tracking-tight text-deep-teal/50">
                {formatCountdown(countdown)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/30">
                until refresh
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card Info */}
      {card && (
        <p className="mt-4 text-center text-[10px] font-semibold text-deep-teal/30">
          Card: {card.cardType.replace('_', ' ')} · ID: {card.id.slice(0, 8)}...
        </p>
      )}
    </div>
  );
}
