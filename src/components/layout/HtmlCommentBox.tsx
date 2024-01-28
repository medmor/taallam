'use client'

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation";
import "@/styles/commentbox.css"

export default function HtmlCommentsBox() {
    const pathName = usePathname();
    const t = useTranslations("commentBox");
    const locale = useLocale();
    useEffect(() => {
        let origin =
            typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : '';
        origin += pathName
        let hcb_user: any = {};
        if (locale == 'ar') {
            hcb_user = {
                comments_header: "لا تتردد في ترك التعليق",
                name_label: 'الإ سم',
                content_label: 'أدخل تعليقك هنا',
                submit: 'تأكيد',
                no_comments_msg: "لم يعلق أحد حتى الآن. كن الاول!",
                add: 'أضف تعليقك',
                again: 'اضف تعليقًا آخر',
                add_image: 'أضف صورة',
                are_you_sure: 'هل تريد وضع علامة على هذا التعليق على أنه غير ملائم؟',

                reply: 'أضف ردا',
                flag: 'أضف تبليغ',
                like: "يعجبني",

                days_ago: 'أيام',
                hours_ago: 'ساعات',
                minutes_ago: 'دقائق',
                within_the_last_minute: 'في الدقيقة الأخيرة',

                msg_thankyou: "شكرا على التعليق",
                msg_approval: "ملاحظة: لا يتم نشر هذا التعليق حتى تتم الموافقة عليه",
                msg_approval_required: "شكرا على التعليق! سيظهر تعليقك بمجرد الموافقة عليه من قبل الوسيط.",

                anonymous: "مجهول الاسم :"
            };
        }
        const s = document.createElement("script"),
            l = origin.replace(/'/g, "%27"),
            h = "https://www.htmlcommentbox.com";
        s.setAttribute("type", "text/javascript");
        s.setAttribute(
            "src",
            h + "/jread?page=" + encodeURIComponent(l).replace("+", "%2B") + "&mod=%241%24wq1rdBcg%24ULEEOXDwJOmf1X6137mqN." + "&opts=16798&num=10&ts=1687870882651");
        s.setAttribute('id', 'htmlcommentid')
        if (typeof s != "undefined") {
            (window as any).hcb_user = hcb_user
            document.getElementById('htmlcommentid')?.remove()
            document.getElementsByTagName("head")[0].appendChild(s);
        }
    }, [pathName, locale])
    return (
        <div className="shadow-lg bg-white p-4 mt-5 sm:min-w-[500px]">
            <div id="HCB_comment_box" className="mt-2 ">
                <div className="p-4 border border-orange-200">
                    {t("refresh")}
                </div>
            </div>
            <link rel="stylesheet" type="text/css" href="https://www.htmlcommentbox.com/static/skins/bootstrap/twitter-bootstrap.css?v=0" />
        </div>
    )
}