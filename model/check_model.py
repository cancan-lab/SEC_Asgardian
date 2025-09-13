import joblib, sys, os

p = os.getenv('VOXHANCE_MODEL', r'D:\SEC\Voxhance BAru\server\models\logreg_mfcc.joblib')
print('LOAD:', p)
obj = joblib.load(p)
print('type(obj)=', type(obj))

def is_est(x):
    return any(hasattr(x,a) for a in ('predict_proba','predict','decision_function'))

if isinstance(obj, dict):
    print('keys=', list(obj.keys()))
    # coba ambil estimator
    est = obj.get('pipeline') or obj.get('model') or obj.get('estimator')
    if est is None:
        for k,v in obj.items():
            if is_est(v):
                est = v; print('found estimator at key:', k); break
    if est is None:
        print('>>> TIDAK ADA ESTIMATOR DI FILE <<<')
        sys.exit(1)
    print('estimator type=', type(est))
    print('has predict:', hasattr(est,'predict'), 'has predict_proba:', hasattr(est,'predict_proba'))
    print('n_features_in_ =', getattr(est,'n_features_in_', None))
else:
    print('has predict:', hasattr(obj,'predict'), 'has predict_proba:', hasattr(obj,'predict_proba'))
    print('n_features_in_ =', getattr(obj,'n_features_in_', None))