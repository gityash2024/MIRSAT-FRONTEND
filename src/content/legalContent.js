// Company names follow the English and Arabic policies supplied by the client.
// Mirsat-specific practices are documented separately from the corporate website.
export const LEGAL_CONTACT_EMAIL = 'support@mirsat.co';
export const LEGAL_UPDATED_DATE = '2026-10-22';
export const CORPORATE_POLICY_URLS = {
  en: 'https://takamolholding.com/en/privacy-policy',
  ar: 'https://takamolholding.com/ar/privacy-policy',
};

const documents = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      summary: 'How Mirsat handles information in its web portal and mobile inspection app.',
      sections: [
        ['About Mirsat', 'Mirsat is presented by Takamol Mobility Services. Takamol Holding Company is the corporate group; its corporate privacy policy is linked below. This policy describes the Mirsat web portal and mobile inspection app specifically. Your organization manages your account, access permissions, assignments, and operational records. Contact your organization or the privacy contact below about the entity responsible for a particular record.'],
        ['Information we handle', 'Account information includes your name, email, role, profile details, and authentication information. Operational information includes tasks, assets, inspection answers, comments, scores, timestamps, signatures, photos, attachments, and reports. The platform also handles notification tokens, limited device and connection information, and service and audit logs.'],
        ['Device permissions and location', 'Camera, photo, and file access support inspection evidence, profile images, attachments, and report exports. When permission is granted and a capture or inspection feature uses it, the mobile app can record location coordinates, a derived address, and capture time with evidence. Notifications deliver work and synchronization alerts. Manage permissions in device settings; denying permission may limit the related feature.'],
        ['Why information is used', 'Information supports sign-in, role-based access, inspection assignments, evidence storage, reporting, offline synchronization, notifications, support, security, and audit history.'],
        ['Offline data', 'The mobile app stores inspection information and queued changes on your device. Pending work and media are sent to the configured Mirsat service when synchronization succeeds. A local save is not confirmation of a server upload. Unsynchronized work may remain locally to avoid loss; check sync status before removing app data or changing accounts.'],
        ['Access and service providers', 'Authorized people in your organization access information according to their permissions. Providers supporting hosting, media storage, transactional email, and push notifications may process information needed for those services. Information may also be disclosed when required by applicable law or to address security incidents. Reports you export or share go to the destination you choose.'],
        ['Security and processing locations', 'Mirsat uses authenticated access, permission controls, and HTTPS for service communications. Credentials use protected mobile storage; operational information also uses local databases and files. Do not assume all device data or exported files are encrypted by the app. Hosting and connected providers may process information in different locations; contact your organization for the arrangements applicable to you.'],
        ['Retention and deletion', 'Retention depends on record purpose and your organization’s operational, audit, security, and applicable legal requirements. Device caches, pending work, server records, exports, and backups may have different retention periods. Request retention details or deletion through your organization or the contact below. Identity and authority are checked, and applicable retention restrictions will be explained. Signing out or uninstalling does not itself delete server records.'],
        ['Your choices and requests', 'You may request access, correction, export, or deletion of eligible personal information and raise concerns about its use. Contact your organization or email the address below with the subject “Mirsat privacy request” and information identifying your account. Do not send passwords or unnecessary sensitive records. You can also manage device permissions through system settings.'],
        ['Children and updates', 'Mirsat is intended for authorized organizational personnel and is not designed as a service for children. This policy may change as platform features or information-handling practices change. Review the last-updated date and contact us for clarification.'],
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      summary: 'Conditions for authorized use of the Mirsat web portal and mobile inspection app.',
      sections: [
        ['Service and organizational agreements', 'Mirsat is presented by Takamol Mobility Services, within the Takamol Holding Company group, and provides tools for inspection assignments, field evidence, reporting, and operational review. These terms describe platform use; applicable organizational agreements and mandatory legal rights continue to apply. Contact your organization or support for details of your arrangements.'],
        ['Authorized accounts', 'Use only an account assigned or approved for you. Protect credentials, follow your organization’s access rules, and report suspected misuse. Your role determines available functions and records. The mobile inspection app accepts inspector accounts; administrative functions are provided through the web portal.'],
        ['Acceptable use', 'Use Mirsat only for authorized work. Do not bypass access controls, access records without authority, interfere with service operation, distribute malicious content, or upload material you are not entitled to use. Obtain required authorization before capturing people, signatures, location information, or confidential material.'],
        ['Inspection evidence and reports', 'You are responsible for the accuracy, completeness, and authorization of submitted information. Review answers, photos, signatures, location metadata, and reports before relying on or distributing them. Automated scores and reports support review; they do not replace professional judgment, site verification, or required approvals.'],
        ['Offline work and synchronization', 'Locally saved information may remain pending until synchronization completes. Check sync status before uninstalling, clearing storage, changing accounts, or handing over a device. Connectivity, device failure, or interrupted uploads may delay server availability. Local confirmation does not prove another user can see the record.'],
        ['Devices and exported files', 'Maintain an appropriate device, connectivity, and permissions. Protect exported reports and shared attachments. External destinations have their own access controls; your organization’s information-handling rules continue to apply.'],
        ['Privacy and ownership', 'The Privacy Policy explains information handling. You and your organization retain rights in information you are entitled to provide; providing it permits processing necessary for platform functions. Using Mirsat does not transfer ownership of its software, branding, or protected materials.'],
        ['Availability and access', 'Maintenance, connectivity, device limitations, and external providers may affect availability. Authorized administrators may restrict accounts or functions, including to address misuse or security issues. Report problems through your organization or support. Any specific service commitments are governed by applicable organizational agreements.'],
        ['Responsibility and changes', 'Use the platform and its outputs according to organizational procedures and applicable law. These terms do not exclude rights or responsibilities that cannot lawfully be excluded. Updated terms may be published as the service changes; review the last-updated date and contact support for clarification.'],
      ],
    },
    labels: { navigation: 'Legal information', home: 'Back to Mirsat', updated: 'Last updated', contact: 'Support and privacy contact', email: 'Email', language: 'Language', corporatePolicy: 'Takamol Holding corporate privacy policy' },
  },
  ar: {
    privacy: {
      title: 'سياسة الخصوصية',
      summary: 'كيفية تعامل Mirsat مع المعلومات في بوابة الويب وتطبيق التفتيش على الهاتف.',
      sections: [
        ['حول Mirsat', 'تُقدَّم Mirsat من تكامل لخدمات التنقل (Takamol Mobility Services). والمجموعة الأم للعميل هي شركة تكامل لخدمات الأعمال القابضة المحدودة، وتتوفر سياستها المؤسسية عبر الرابط أدناه. تصف هذه السياسة بوابة Mirsat وتطبيق التفتيش تحديداً. تدير مؤسستك حسابك وصلاحياتك ومهامك وسجلاتك التشغيلية. تواصل مع مؤسستك أو جهة الاتصال أدناه للاستفسار عن الجهة المسؤولة عن سجل معين.'],
        ['المعلومات التي نعالجها', 'تشمل معلومات الحساب الاسم والبريد الإلكتروني والدور والملف الشخصي ومعلومات المصادقة. وتشمل المعلومات التشغيلية المهام والأصول وإجابات التفتيش والتعليقات والدرجات والتواريخ والتوقيعات والصور والمرفقات والتقارير. كما تعالج المنصة رموز الإشعارات ومعلومات محدودة عن الجهاز والاتصال وسجلات الخدمة والتدقيق.'],
        ['أذونات الجهاز والموقع', 'تدعم أذونات الكاميرا والصور والملفات أدلة التفتيش وصور الملف الشخصي والمرفقات وتصدير التقارير. عند منح الإذن واستخدام ميزة تصوير أو تفتيش تتطلب الموقع، يمكن للتطبيق تسجيل الإحداثيات والعنوان المستنتج ووقت الالتقاط مع الأدلة. تُستخدم الإشعارات لتنبيهات العمل والمزامنة. يمكنك إدارة الأذونات من إعدادات الجهاز، وقد يحد رفض الإذن من الميزة المرتبطة به.'],
        ['أغراض استخدام المعلومات', 'تُستخدم المعلومات لتسجيل الدخول وتطبيق الصلاحيات وإسناد التفتيش وحفظ الأدلة وإعداد التقارير والمزامنة دون اتصال والإشعارات والدعم والأمن وسجل التدقيق.'],
        ['البيانات دون اتصال', 'يخزن تطبيق الهاتف معلومات التفتيش والتغييرات المعلقة على جهازك. يُرسل العمل المعلق والوسائط إلى خدمة Mirsat المهيأة عند نجاح المزامنة. لا يعني الحفظ المحلي اكتمال الرفع إلى الخادم. قد يبقى العمل غير المتزامن محلياً لتجنب فقدانه؛ تحقق من المزامنة قبل مسح بيانات التطبيق أو تغيير الحساب.'],
        ['الوصول ومقدمو الخدمات', 'يصل الأشخاص المخولون في مؤسستك إلى المعلومات حسب صلاحياتهم. وقد يعالج مقدمو الاستضافة وتخزين الوسائط والبريد التشغيلي والإشعارات المعلومات اللازمة لخدماتهم. وقد يُفصح عن المعلومات عند وجود متطلب قانوني أو لمعالجة حادث أمني. تُرسل التقارير التي تصدرها أو تشاركها إلى الوجهة التي تختارها.'],
        ['الأمن ومواقع المعالجة', 'تستخدم Mirsat المصادقة وضوابط الصلاحيات واتصالات HTTPS للخدمات. تُحفظ بيانات الدخول في تخزين محمي على الهاتف، وتُحفظ معلومات تشغيلية أيضاً في قواعد بيانات وملفات محلية. لا تفترض أن التطبيق يشفر جميع بيانات الجهاز أو الملفات المصدرة. قد يعالج مقدمو الاستضافة والخدمات المرتبطة المعلومات في مواقع مختلفة؛ تواصل مع مؤسستك لمعرفة الترتيبات الخاصة بك.'],
        ['الاحتفاظ والحذف', 'تعتمد مدة الاحتفاظ على غرض السجل ومتطلبات مؤسستك التشغيلية والتدقيقية والأمنية والقانونية. وقد تختلف المدد بين البيانات المؤقتة والعمل المعلق وسجلات الخادم والتقارير المصدرة والنسخ الاحتياطية. اطلب تفاصيل الاحتفاظ أو الحذف عبر مؤسستك أو جهة الاتصال أدناه. تُراجع الهوية والصلاحية وتُوضح قيود الاحتفاظ الواجبة. لا يؤدي تسجيل الخروج أو إزالة التطبيق وحده إلى حذف سجلات الخادم.'],
        ['الخيارات والطلبات', 'يمكنك طلب الوصول إلى معلوماتك الشخصية المؤهلة أو تصحيحها أو تصديرها أو حذفها وإبداء ملاحظات بشأن استخدامها. تواصل مع مؤسستك أو راسل البريد أدناه بعنوان «طلب خصوصية Mirsat» مع معلومات تحدد حسابك. لا ترسل كلمات المرور أو سجلات حساسة غير ضرورية. يمكنك أيضاً إدارة الأذونات من إعدادات الجهاز.'],
        ['الأطفال والتحديثات', 'Mirsat مخصصة للأشخاص المخولين من المؤسسات وليست مصممة كخدمة للأطفال. قد تتغير السياسة عند تغيير وظائف المنصة أو ممارسات معالجة المعلومات. راجع تاريخ آخر تحديث وتواصل معنا لطلب التوضيح.'],
      ],
    },
    terms: {
      title: 'الشروط والأحكام',
      summary: 'شروط الاستخدام المصرح به لبوابة Mirsat وتطبيق التفتيش على الهاتف.',
      sections: [
        ['الخدمة واتفاقيات المؤسسة', 'تُقدَّم Mirsat من تكامل لخدمات التنقل (Takamol Mobility Services) ضمن مجموعة شركة تكامل لخدمات الأعمال القابضة المحدودة، وتوفر أدوات لإسناد التفتيش وجمع الأدلة وإعداد التقارير والمراجعة التشغيلية. تصف هذه الشروط استخدام المنصة مع استمرار سريان الاتفاقيات المؤسسية والحقوق القانونية الإلزامية. تواصل مع مؤسستك أو الدعم لمعرفة الترتيبات الخاصة بك.'],
        ['الحسابات المصرح بها', 'استخدم فقط الحساب المعتمد أو المخصص لك. احم بيانات الدخول والتزم بقواعد الوصول وأبلغ عن أي اشتباه بسوء استخدام. يحدد دورك الوظائف والسجلات المتاحة. يقبل تطبيق التفتيش حسابات المفتشين، وتتاح الوظائف الإدارية عبر بوابة الويب.'],
        ['الاستخدام المقبول', 'استخدم Mirsat للأعمال المصرح بها فقط. لا تتجاوز ضوابط الوصول أو تدخل السجلات دون تخويل أو تعطل الخدمة أو تنشر محتوى ضاراً أو ترفع مواد لا يحق لك استخدامها. احصل على التفويض المطلوب قبل التقاط صور الأشخاص أو التوقيعات أو معلومات الموقع أو المواد السرية.'],
        ['أدلة التفتيش والتقارير', 'أنت مسؤول عن دقة المعلومات المقدمة واكتمالها وصلاحية تقديمها. راجع الإجابات والصور والتوقيعات وبيانات الموقع والتقارير قبل الاعتماد عليها أو توزيعها. تدعم الدرجات والتقارير الآلية المراجعة ولا تحل محل التقدير المهني أو التحقق الميداني أو الموافقات المطلوبة.'],
        ['العمل دون اتصال والمزامنة', 'قد تبقى المعلومات المحفوظة محلياً معلقة حتى اكتمال المزامنة. تحقق من حالتها قبل إزالة التطبيق أو مسح التخزين أو تغيير الحساب أو تسليم الجهاز. قد يؤخر الاتصال أو تعطل الجهاز أو انقطاع الرفع وصول المعلومات إلى الخادم. لا يثبت التأكيد المحلي إتاحة السجل للمستخدمين الآخرين.'],
        ['الأجهزة والملفات المصدرة', 'استخدم جهازاً واتصالاً وأذونات مناسبة. احم التقارير المصدرة والمرفقات المشتركة. للوجهات الخارجية ضوابط وصول خاصة بها، وتظل قواعد مؤسستك لمعالجة المعلومات سارية.'],
        ['الخصوصية والملكية', 'توضح سياسة الخصوصية كيفية معالجة المعلومات. تحتفظ أنت ومؤسستك بالحقوق في المعلومات التي يحق لكما تقديمها، ويسمح تقديمها بمعالجتها اللازمة لوظائف المنصة. لا ينقل استخدام Mirsat ملكية البرمجيات أو العلامات أو المواد المحمية.'],
        ['التوافر والوصول', 'قد يتأثر التوافر بالصيانة أو الاتصال أو قيود الجهاز أو مقدمي الخدمات الخارجية. يمكن للمسؤولين المخولين تقييد الحسابات أو الوظائف، بما في ذلك معالجة سوء الاستخدام أو المشكلات الأمنية. أبلغ عن المشكلات عبر مؤسستك أو الدعم. تحكم الاتفاقيات المؤسسية الواجبة أي التزامات محددة للخدمة.'],
        ['المسؤولية والتغييرات', 'استخدم المنصة ومخرجاتها وفق إجراءات مؤسستك والقوانين المعمول بها. لا تستبعد هذه الشروط الحقوق أو المسؤوليات التي لا يجوز استبعادها قانوناً. قد تُنشر شروط محدثة عند تغيير الخدمة؛ راجع تاريخ آخر تحديث وتواصل مع الدعم لطلب التوضيح.'],
      ],
    },
    labels: { navigation: 'المعلومات القانونية', home: 'العودة إلى Mirsat', updated: 'آخر تحديث', contact: 'التواصل للدعم والخصوصية', email: 'البريد الإلكتروني', language: 'اللغة', corporatePolicy: 'سياسة الخصوصية المؤسسية لتكامل القابضة' },
  },
};

export const getLegalContent = (language = 'en') => documents[language === 'ar' ? 'ar' : 'en'];
