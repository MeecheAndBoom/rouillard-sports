import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { SITE } from "@/lib/constants";

/** Absolute URL for assets: email clients cannot resolve relative paths. */
function assetUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://www.rouillard-sport.com";
  return `${base.replace(/\/$/, "")}${path}`;
}

export const styles = {
  body: {
    backgroundColor: "#08090a",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    margin: 0,
    padding: "32px 16px",
  },
  card: {
    backgroundColor: "#14171a",
    border: "1px solid #2a2e34",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "36px 32px",
  },
  h1: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    margin: "0 0 14px",
  },
  text: {
    color: "#9aa2ab",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0 0 14px",
  },
  muted: { color: "#7b838d", fontSize: "12.5px", lineHeight: "1.6" },
  logo: {
    display: "block",
    height: "28px",
    width: "auto" as const,
    margin: "0 0 22px",
  },
  code: {
    backgroundColor: "#0e1012",
    border: "1px solid #2a2e34",
    color: "#c9a227",
    display: "block",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    margin: "16px 0",
    padding: "14px 18px",
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: "#c9a227",
    borderRadius: "0",
    color: "#0a0b0c",
    display: "inline-block",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: "8px 0 20px",
    padding: "13px 26px",
    textDecoration: "none",
    textTransform: "uppercase" as const,
  },
  table: {
    width: "100%" as const,
    borderCollapse: "collapse" as const,
    margin: "8px 0 16px",
  },
  row: { padding: "8px 0", borderBottom: "1px solid #1a1d21" },
  cell: {
    color: "#f2f3f4",
    fontSize: "14px",
    padding: "6px 0",
    verticalAlign: "top" as const,
  },
  cellRight: {
    color: "#f2f3f4",
    fontSize: "14px",
    padding: "6px 0",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  total: { fontWeight: 700, fontSize: "16px", color: "#c9a227" },
};

export type EmailShellProps = {
  lang: "fr" | "en";
  preview: string;
  heading: string;
  children: React.ReactNode;
  cta?: { label: string; href: string };
  reference?: string;
};

/**
 * Shared shell for every transactional email. Dark carbon surfaces, gold
 * machined hardware and square geometry, so the brand reads the same in the
 * inbox as on the storefront.
 */
export function EmailShell({
  lang,
  preview,
  heading,
  children,
  cta,
  reference,
}: EmailShellProps) {
  const footer = `© ${new Date().getFullYear()} ${SITE.name} | ${SITE.address}`;

  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Img
            src={assetUrl("/full-logo.png")}
            alt={SITE.name}
            width={180}
            height={61}
            style={styles.logo}
          />
          <Heading style={styles.h1}>{heading}</Heading>
          {reference ? <div style={styles.code}>{reference}</div> : null}
          <Section>{children}</Section>
          {cta ? (
            <Button href={cta.href} style={styles.button}>
              {cta.label}
            </Button>
          ) : null}
          <Hr style={{ borderColor: "#2a2e34", margin: "20px 0 16px" }} />
          <Text style={styles.muted}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

/** Two-column label/value rows for order summaries. */
export function SummaryRows({
  rows,
  totalRow,
}: {
  rows: { label: string; value: string }[];
  totalRow?: { label: string; value: string };
}) {
  return (
    <table style={styles.table}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} style={styles.row}>
            <td style={styles.cell}>{row.label}</td>
            <td style={styles.cellRight}>{row.value}</td>
          </tr>
        ))}
        {totalRow ? (
          <tr>
            <td style={{ ...styles.cell, ...styles.total }}>{totalRow.label}</td>
            <td style={{ ...styles.cellRight, ...styles.total }}>{totalRow.value}</td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
