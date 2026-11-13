; 제거할 때 '윈도우 시작 시 실행' 등록도 지운다 (업데이트 설치일 때는 그대로 둠)
!macro customUnInstall
  ${ifNot} ${isUpdated}
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.quest.scheduler"
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "com.quest.scheduler"
  ${endIf}
!macroend
