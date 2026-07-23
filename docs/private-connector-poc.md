# Private Connector demo integration

이 브랜치는 고객사 backend가 이미 발급한 `subjectId`를 데모 SDK에 전달하는
경계만 검증합니다. HMAC 키와 원본 고객 ID는 브라우저 코드에 포함하지 않습니다.

기본 실행은 기존 `userId` 경로이며 동작이 바뀌지 않습니다. 실험하려면 SDK 로드
전에 backend가 다음 전역 값을 명시적으로 주입해야 합니다.

```html
<script>
  window.LoopAdPrivacyPocConfig = {
    collectorUrl: "https://collector.example/private/v2/events",
    identityNamespace: "hotel-customer",
    identityKeyVersion: "key-v1",
    policyVersion: "privacy-policy.v1",
    purposeIds: ["personalized_marketing"]
  };
</script>
```

현재 배포된 SDK와 Dashboard serving API는 이 실험 계약을 지원하지 않습니다.
로컬에서 Event SDK와 Advertisement SDK의 개인정보 실험 브랜치 산출물을 함께
사용할 때만 검증할 수 있습니다.
