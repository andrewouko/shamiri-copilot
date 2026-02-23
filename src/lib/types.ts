import { NextResponse } from "next/server";
import type { Analysis, Review } from "@prisma/client";

// ─── Discriminated union for all API responses ────────────────────────────────

export type ApiResponse<
  ResponseData,
  ErrorCode extends string = string,
> =
  | { success: true; data: ResponseData; error: undefined }
  | { success: false; data: undefined; error: { code: ErrorCode; message: string } };

// ─── Route helpers ────────────────────────────────────────────────────────────

export function apiOk<ResponseData>(data: ResponseData, status = 200) {
  return NextResponse.json<ApiResponse<ResponseData>>(
    { success: true, data, error: undefined },
    { status }
  );
}

export function apiError<ErrorCode extends string>(
  code: ErrorCode,
  message: string,
  status: number
) {
  return NextResponse.json<ApiResponse<never, ErrorCode>>(
    { success: false, data: undefined, error: { code, message } },
    { status }
  );
}

// ─── Per-route response data ──────────────────────────────────────────────────

export interface LoginResponseData {
  supervisor: { id: string; name: string; email: string };
}

export interface AnalyzeResponseData {
  analysis: Analysis;
}

export interface ReviewResponseData {
  review: Review;
}

export interface LogoutResponseData {
  message: string;
}

// ─── Per-route error codes ────────────────────────────────────────────────────

export enum LoginErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export enum SessionErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export enum AnalyzeErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  AI_ANALYSIS_FAILED = "AI_ANALYSIS_FAILED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export enum ReviewErrorCode {
  NOT_FOUND = "NOT_FOUND",
  NOT_ANALYZED = "NOT_ANALYZED",
  UNAUTHORIZED = "UNAUTHORIZED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}