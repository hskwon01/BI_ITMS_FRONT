1. Git Clone
  1) 현재 작업 디렉토리를 복제 대상 디렉토리로 변경
  2) git clone https://github.com/IsuKim/BI_ITMS.git

2. .env 파일 생성
  1) /backend/.env
    PORT=5000
    DB_URL=postgresql://유저명:비밀번호@아이피:포트(default:5432)/DB명
    JWT_SECRET=임의 설정

  2) /frontend/.env
    REACT_APP_API_URL=http://아이피:포트(default:5000)/api

3. 필요 모듈 설치
  1) 터미널 열기
     cd backend 입력
     npm install 입력
     명령어 입력하여 node_modules 설치
  2) cd frontend
     npm install
      
  * npm 실행 오류시 Window PowerShell 스크립트 실행 정책 수정
    1) Window 시작 메뉴에서 powerShell "관리자 권한으로 실행"
    2) Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine 입력
    3) 변경하시겠습니까? Y 입력
    4) Get-ExecutionPolicy 입력
    5) "RemoteSigned" 출력 확인 후 npm install 수행
       
       
  
