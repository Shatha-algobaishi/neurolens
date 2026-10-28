import type { ConditionIndicator, DomainScores } from "../../engine/types";
import { DOMAIN_ORDER } from "../../engine/scoring";
import type { Locale } from "../../types";

const domainNames: Record<Locale, Record<string, string>> = {
  ar: {
    attention: "الانتباه",
    workingMemory: "الذاكرة العاملة",
    processingSpeed: "سرعة المعالجة",
    executiveFunction: "الوظائف التنفيذية",
    flexibility: "المرونة المعرفية",
    impulseControl: "ضبط الاندفاع",
    socialCognition: "الإدراك الاجتماعي",
    language: "اللغة",
    numeracy: "الحس العددي",
    emotionalWellbeing: "الرفاه النفسي",
  },
  en: {
    attention: "attention",
    workingMemory: "working memory",
    processingSpeed: "processing speed",
    executiveFunction: "executive function",
    flexibility: "cognitive flexibility",
    impulseControl: "impulse control",
    socialCognition: "social cognition",
    language: "language",
    numeracy: "numeracy",
    emotionalWellbeing: "emotional wellbeing",
  },
};

export function generateLocalNarrative(
  name: string,
  domainScores: DomainScores,
  conditions: ConditionIndicator[],
  locale: Locale
): string {
  const names = domainNames[locale];
  const sorted = [...DOMAIN_ORDER].sort((a, b) => domainScores[b] - domainScores[a]);
  const strongest = names[sorted[0]];
  const weakest = names[sorted[sorted.length - 1]];
  const referCount = conditions.filter((c) => c.level === "refer").length;

  if (locale === "ar") {
    const closing =
      referCount > 0
        ? "أظهرت بعض المؤشرات نتائج تستحق مراجعة مختص للاطمئنان أكثر — وهذا أمر طبيعي وشائع، وليس تشخيصاً."
        : "جميع المؤشرات ضمن المعدل المتوقع اليوم — استمر باللعب بانتظام لمتابعة تطور بصمتك المعرفية.";
    return `مرحباً ${name}! أنجزت الفحص بنجاح. من بين مجالاتك العشرة، برز مجال ${strongest} كنقطة قوة واضحة، بينما قد يستفيد مجال ${weakest} من بعض التمارين الإضافية. ${closing} تذكّر أن هذا فحص مبكر وليس تشخيصاً طبياً.`;
  }

  const closing =
    referCount > 0
      ? "A few indicators showed results worth checking with a specialist for peace of mind — this is common and not a diagnosis."
      : "All indicators are within the expected range today — keep playing regularly to track how your fingerprint evolves.";
  return `Hi ${name}! You completed the screening. Among your ten domains, ${strongest} stood out as a clear strength, while ${weakest} could benefit from a little extra practice. ${closing} Remember, this is an early screening, not a medical diagnosis.`;
}
